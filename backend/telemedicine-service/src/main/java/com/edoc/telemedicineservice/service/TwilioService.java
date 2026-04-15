package com.edoc.telemedicineservice.service;

import com.twilio.Twilio;
import com.twilio.jwt.accesstoken.AccessToken;
import com.twilio.jwt.accesstoken.VideoGrant;
import com.twilio.rest.video.v1.Room;
import com.twilio.exception.TwilioException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
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
        }
    }

    public String createRoom(String roomName) {
        if (!hasBaseCredentials()) {
            return "local-room-" + roomName;
        }
        try {
            Room room = Room.creator()
                    .setUniqueName(roomName)
                    .setType(Room.RoomType.GO)
                    .create();
            return room.getSid();
        } catch (TwilioException e) {
            // Room might already exist, try to fetch it
            Room room = Room.fetcher(roomName).fetch();
            return room.getSid();
        }
    }

    public String generateToken(String roomName, String identity) {
        if (!hasTokenCredentials()) {
            return "local-token-" + identity + "-" + roomName;
        }

        VideoGrant grant = new VideoGrant().setRoom(roomName);

        AccessToken token = new AccessToken.Builder(
                accountSid,
                apiKeySid,
                apiSecret
        ).identity(identity).grant(grant).build();

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
