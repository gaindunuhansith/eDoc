package com.edoc.userservice.service;

import com.edoc.userservice.payload.response.AuthResponse;
import com.edoc.userservice.payload.request.LoginUserRequest;
import com.edoc.userservice.payload.request.RegisterUserRequest;

public interface AuthService {

    AuthResponse register(RegisterUserRequest request);

    AuthResponse login(LoginUserRequest request);
}
