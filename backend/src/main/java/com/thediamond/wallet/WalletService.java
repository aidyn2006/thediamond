package com.thediamond.wallet;

import com.thediamond.api.dto.WalletDtos.*;
import com.thediamond.domain.*;
import com.thediamond.error.ApiException;
import com.thediamond.notify.InAppNotificationService;
import com.thediamond.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class WalletService {

    /** One-time reward for advertising TheDiamond (spec: "первое задание"). */
    public static final long ADVERTISE_REWARD = 500;
    /** Higher one-time reward when the advertising post is published on Threads. */
    public static final long THREADS_REWARD = 1000;
    /** Minimum amount a user may withdraw. */
    public static final long MIN_WITHDRAWAL = 2000;

    private final WalletRepository wallets;
    private final WalletTransactionRepository transactions;
    private final WithdrawalRepository withdrawals;
    private final UserRepository users;
    private final InAppNotificationService inApp;

    public WalletService(WalletRepository wallets, WalletTransactionRepository transactions,
                         WithdrawalRepository withdrawals, UserRepository users,
                         InAppNotificationService inApp) {
        this.wallets = wallets;
        this.transactions = transactions;
        this.withdrawals = withdrawals;
        this.users = users;
        this.inApp = inApp;
    }

    // ---------- Core ledger ----------

    @Transactional
    public Wallet getOrCreate(Long userId) {
        return wallets.findByUserId(userId).orElseGet(() -> {
            User user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
            Wallet w = new Wallet();
            w.setUser(user);
            return wallets.save(w);
        });
    }

    /** Post a ledger entry and move the balance. Positive amount credits, negative debits. */
    @Transactional
    public Wallet post(Long userId, long amount, WalletTransactionType type, String description) {
        Wallet w = getOrCreate(userId);
        long next = w.getBalance() + amount;
        if (next < 0) {
            throw ApiException.badRequest("INSUFFICIENT_FUNDS", "Недостаточно средств на балансе");
        }
        w.setBalance(next);
        wallets.save(w);
        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(w);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setDescription(description);
        transactions.save(tx);
        return w;
    }

    /**
     * Credits the one-time "advertise us" reward, if not already paid. The amount depends on
     * the platform: {@link #THREADS_REWARD}₸ for a Threads post, {@link #ADVERTISE_REWARD}₸ otherwise.
     * Called when the creator's social-proof post is approved (auto or by admin).
     */
    @Transactional
    public void creditAdvertiseReward(Long userId, Platform platform) {
        User user = users.findById(userId).orElse(null);
        if (user == null || user.isRewardTaskPaid()) return;
        long amount = platform == Platform.THREADS ? THREADS_REWARD : ADVERTISE_REWARD;
        user.setRewardTaskPaid(true);
        users.save(user);
        post(userId, amount, WalletTransactionType.REWARD,
                "Награда за рекламу TheDiamond" + (platform == Platform.THREADS ? " в Threads" : ""));
        inApp.send(userId, "Начислено " + amount + " ₸",
                "Спасибо за пост о TheDiamond! Награда зачислена на ваш кошелёк.");
    }

    // ---------- Read ----------

    @Transactional
    public WalletResponse view(Long userId) {
        Wallet w = getOrCreate(userId);
        List<TransactionItem> txs = transactions.findByWalletIdOrderByCreatedAtDesc(w.getId()).stream()
                .map(t -> new TransactionItem(t.getId(), t.getAmount(), t.getType().name(),
                        t.getDescription(), t.getCreatedAt()))
                .toList();
        List<WithdrawalItem> wds = withdrawals.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toWithdrawalItem)
                .toList();
        return new WalletResponse(w.getBalance(), MIN_WITHDRAWAL, w.getBalance() >= MIN_WITHDRAWAL, txs, wds);
    }

    // ---------- Withdrawals ----------

    @Transactional
    public WithdrawalItem requestWithdrawal(Long userId, WithdrawRequest req) {
        if (req.amount() < MIN_WITHDRAWAL) {
            throw ApiException.badRequest("MIN_WITHDRAWAL", "Минимальная сумма вывода — " + MIN_WITHDRAWAL + " ₸");
        }
        Wallet w = getOrCreate(userId);
        if (w.getBalance() < req.amount()) {
            throw ApiException.badRequest("INSUFFICIENT_FUNDS", "Недостаточно средств на балансе");
        }
        // Hold funds immediately by debiting the wallet; refunded on rejection.
        post(userId, -req.amount(), WalletTransactionType.WITHDRAWAL,
                "Заявка на вывод на " + req.requisites());
        Withdrawal wd = new Withdrawal();
        wd.setUser(w.getUser());
        wd.setAmount(req.amount());
        wd.setRequisites(req.requisites().trim());
        wd.setStatus(WithdrawalStatus.PENDING);
        withdrawals.save(wd);
        return toWithdrawalItem(wd);
    }

    // ---------- Admin ----------

    @Transactional(readOnly = true)
    public List<WithdrawalItem> listWithdrawals(String status) {
        List<Withdrawal> list;
        if (status == null || status.isBlank() || status.equalsIgnoreCase("all")) {
            list = withdrawals.findAllByOrderByCreatedAtDesc();
        } else {
            list = withdrawals.findByStatusOrderByCreatedAtDesc(WithdrawalStatus.valueOf(status.toUpperCase()));
        }
        return list.stream().map(this::toWithdrawalItem).toList();
    }

    @Transactional
    public WithdrawalItem markPaid(Long id) {
        Withdrawal wd = requirePending(id);
        wd.setStatus(WithdrawalStatus.PAID);
        wd.setReviewedAt(Instant.now());
        withdrawals.save(wd);
        inApp.send(wd.getUser().getId(), "Вывод выполнен",
                "Вывод " + wd.getAmount() + " ₸ отправлен на " + wd.getRequisites() + ".");
        return toWithdrawalItem(wd);
    }

    @Transactional
    public WithdrawalItem reject(Long id, String reason) {
        Withdrawal wd = requirePending(id);
        wd.setStatus(WithdrawalStatus.REJECTED);
        wd.setRejectReason(reason == null || reason.isBlank() ? null : reason.trim());
        wd.setReviewedAt(Instant.now());
        withdrawals.save(wd);
        // Refund the held amount back to the wallet.
        post(wd.getUser().getId(), wd.getAmount(), WalletTransactionType.REFUND,
                "Возврат по отклонённой заявке на вывод");
        inApp.send(wd.getUser().getId(), "Заявка на вывод отклонена",
                "Сумма " + wd.getAmount() + " ₸ возвращена на баланс."
                        + (wd.getRejectReason() != null ? " Причина: " + wd.getRejectReason() : ""));
        return toWithdrawalItem(wd);
    }

    private Withdrawal requirePending(Long id) {
        Withdrawal wd = withdrawals.findById(id)
                .orElseThrow(() -> ApiException.notFound("Заявка не найдена"));
        if (wd.getStatus() != WithdrawalStatus.PENDING) {
            throw ApiException.badRequest("WITHDRAWAL_NOT_PENDING", "Заявка уже обработана");
        }
        return wd;
    }

    private WithdrawalItem toWithdrawalItem(Withdrawal wd) {
        return new WithdrawalItem(wd.getId(), wd.getAmount(), wd.getStatus().name(),
                wd.getRequisites(), wd.getRejectReason(), wd.getCreatedAt(), wd.getReviewedAt());
    }
}
