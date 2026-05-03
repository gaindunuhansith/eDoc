package com.edoc.userservice.service.impl;

import com.edoc.userservice.payload.response.AuthResponse;
import com.edoc.userservice.payload.request.LoginUserRequest;
import com.edoc.userservice.payload.request.RegisterUserRequest;
import com.edoc.userservice.exception.EmailAlreadyExistsException;
import com.edoc.userservice.exception.UnauthorizedOperationException;
import com.edoc.userservice.mapper.UserMapper;
import com.edoc.userservice.model.User;
import com.edoc.userservice.model.enums.UserRole;
import com.edoc.userservice.repository.UserRepository;
import com.edoc.userservice.security.JwtService;
import com.edoc.userservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterUserRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailAndIsDeletedFalse(normalizedEmail)) {
            throw new EmailAlreadyExistsException("A user already exists with the given email");
        }

        if (request.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Cannot register with ADMIN role");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber().trim())
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);

        log.info("Registered new user userId={} role={}", saved.getUserId(), saved.getRole());

        return AuthResponse.builder()
                .token(token)
                .expiresIn(jwtService.getExpiration())
                .user(userMapper.toResponse(saved))
                .build();
    }

    @Override
    public AuthResponse login(LoginUserRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userRepository.findByEmailAndIsDeletedFalse(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedOperationException("Account is deactivated");
        }

        String token = jwtService.generateToken(user);

        log.info("User login successful userId={}", user.getUserId());

        return AuthResponse.builder()
                .token(token)
                .expiresIn(jwtService.getExpiration())
                .user(userMapper.toResponse(user))
                .build();
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
