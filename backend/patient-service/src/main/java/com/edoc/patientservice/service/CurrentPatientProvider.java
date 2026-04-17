package com.edoc.patientservice.service;

// Resolves the currently authenticated patient id for /me endpoints.
public interface CurrentPatientProvider {

    String getCurrentPatientId();
}
