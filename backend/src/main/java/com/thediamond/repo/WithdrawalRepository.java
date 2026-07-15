package com.thediamond.repo;

import com.thediamond.domain.Withdrawal;
import com.thediamond.domain.WithdrawalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    List<Withdrawal> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Withdrawal> findAllByOrderByCreatedAtDesc();
    List<Withdrawal> findByStatusOrderByCreatedAtDesc(WithdrawalStatus status);
}
