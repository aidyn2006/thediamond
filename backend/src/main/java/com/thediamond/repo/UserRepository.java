package com.thediamond.repo;

import com.thediamond.domain.Role;
import com.thediamond.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByEmailContainingIgnoreCaseOrderByCreatedAtDesc(String email);
}
