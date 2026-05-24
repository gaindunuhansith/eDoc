package com.edoc.telemedicineservice.service;

import com.twilio.Twilio;
import com.twilio.exception.TwilioException;
import com.twilio.jwt.accesstoken.AccessToken;
import com.twilio.jwt.accesstoken.VideoGrant;
import com.twilio.rest.video.v1.Room;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioService {

    @Value("${telemedicine.twilio.account-sid}")
    private String accountSid;

    @Value("${telemedicine.twilio.auth-token}")
    private String authToken;

    @Value("${telemedicine.twilio.api-key-sid}")
    private String apiKeySid;

    @Value("${telemedicine.twilio.api-secret}")
    private String apiSecret;

    @PostConstruct
    public void init() {
        if (hasText(accountSid) && hasText(authToken)) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio initialized successfully");
        } else {
            log.warn("Twilio credentials not configured — running in local/mock mode");
        }
    }

    public String createRoom(String roomName) {
        if (!hasBaseCredentials()) {
            log.debug("No Twilio credentials — returning local room for: {}", roomName);
            return "local-room-" + roomName;
        }
        try {
            Room room = Room.creator()
                    .setUniqueName(roomName)
                    .setType(Room.RoomType.GROUP)
                    .create();
            return room.getSid();
        } catch (TwilioException e) {
            log.warn("Room '{}' may already exist, fetching existing: {}", roomName, e.getMessage());
            Room room = Room.fetcher(roomName).fetch();
            return room.getSid();
        }
    }

    public String generateToken(String roomName, String identity) {
        if (!hasTokenCredentials()) {
            log.debug("No Twilio token credentials — returning local token for identity: {}", identity);
            return "local-token-" + identity + "-" + roomName;
        }

        VideoGrant grant = new VideoGrant().setRoom(roomName);
        AccessToken token = new AccessToken.Builder(accountSid, apiKeySid, apiSecret)
                .identity(identity)
                .grant(grant)
                .build();
        return token.toJwt();
    }

    private boolean hasBaseCredentials() {
        return hasText(accountSid) && hasText(authToken);
    }

    private boolean hasTokenCredentials() {
        return hasBaseCredentials() && hasText(apiKeySid) && hasText(apiSecret);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
