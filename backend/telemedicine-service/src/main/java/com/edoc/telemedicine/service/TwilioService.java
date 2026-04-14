package com.edoc.telemedicine.service;

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

    @Value("${telemedicine.twilio.api-key}")
    private String apiKey;

    @Value("${telemedicine.twilio.api-secret}")
    private String apiSecret;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public String createRoom(String roomName) {
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
        VideoGrant grant = new VideoGrant().setRoom(roomName);

        AccessToken token = new AccessToken.Builder(
                accountSid,
                apiKey,
                apiSecret
        ).identity(identity).grant(grant).build();

        return token.toJwt();
    }
}
