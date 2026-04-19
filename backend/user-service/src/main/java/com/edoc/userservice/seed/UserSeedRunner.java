package com.edoc.userservice.seed;

import com.edoc.userservice.model.User;
import com.edoc.userservice.model.enums.UserRole;
import com.edoc.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserSeedRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserSeedRunner.class);
    private static final String DEFAULT_PASSWORD = "Password123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        userRepository.deleteAll();

        List<User> users = new ArrayList<>();
        users.addAll(buildUsers(UserRole.ADMIN, 15, "admin"));
        users.addAll(buildUsers(UserRole.DOCTOR, 15, "doctor"));
        users.addAll(buildUsers(UserRole.PATIENT, 15, "patient"));

        userRepository.saveAll(users);
        log.info("Seeded {} users (15 per role)", users.size());
    }

    private List<User> buildUsers(UserRole role, int count, String prefix) {
        List<User> users = new ArrayList<>(count);
        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        for (int i = 1; i <= count; i++) {
            LocalDateTime createdAt = LocalDateTime.now().minusDays(i);
            boolean isInactive = i == 1;
            boolean isDeleted = i == 2;

            User user = User.builder()
                    .name(capitalize(prefix) + " User " + i)
                    .email(prefix + i + "@edoc.com")
                    .password(encodedPassword)
                    .phoneNumber(String.format("555%07d", i))
                    .role(role)
                    .isProfileCreated(role != UserRole.ADMIN)
                    .isActive(!isInactive && !isDeleted)
                    .isDeleted(isDeleted)
                    .createdAt(createdAt)
                    .updatedAt(createdAt)
                    .deletedAt(isDeleted ? createdAt.plusHours(2) : null)
                    .build();

            users.add(user);
        }

        return users;
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.substring(0, 1).toUpperCase() + value.substring(1);
    }
}
