package com.edoc.userservice.service;

import com.edoc.userservice.dto.AuthResponse;
import com.edoc.userservice.dto.LoginUserRequest;
import com.edoc.userservice.dto.RegisterUserRequest;

public interface IAuthService {

    AuthResponse register(RegisterUserRequest request);

    AuthResponse login(LoginUserRequest request);
}
