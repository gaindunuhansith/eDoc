package com.edoc.apigateway.ratelimit;

import com.edoc.apigateway.config.RateLimitProperties;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class RateLimitBucketRegistry {

    private final RateLimitProperties properties;
    private final Map<String, BucketState> buckets = new ConcurrentHashMap<>();
    private final AtomicInteger accessCounter = new AtomicInteger();

    public RateLimitBucketRegistry(RateLimitProperties properties) {
        this.properties = properties;
    }

    public boolean tryConsume(String category, String clientKey) {
        String bucketKey = category + ":" + clientKey;
        RateLimitProperties.Policy policy = getPolicy(category);
        BucketState bucketState = buckets.computeIfAbsent(bucketKey,
                key -> new BucketState(new InMemoryTokenBucket(policy.getReplenishRate(), policy.getBurstCapacity())));

        bucketState.lastSeenEpochSecond = Instant.now().getEpochSecond();
        maybeCleanup();
        return bucketState.bucket.tryConsume();
    }

    private void maybeCleanup() {
        int every = Math.max(1, properties.getCleanupInterval());
        int current = accessCounter.incrementAndGet();
        if (current % every != 0) {
            return;
        }

        long now = Instant.now().getEpochSecond();
        long ttl = Math.max(30, properties.getIdleTtlSeconds());
        buckets.entrySet().removeIf(entry -> now - entry.getValue().lastSeenEpochSecond > ttl);
    }

    private RateLimitProperties.Policy getPolicy(String category) {
        return switch (category) {
            case "auth" -> properties.getAuth();
            case "payments" -> properties.getPayments();
            default -> properties.getDefaults();
        };
    }

    private static final class BucketState {
        private final InMemoryTokenBucket bucket;
        private volatile long lastSeenEpochSecond;

        private BucketState(InMemoryTokenBucket bucket) {
            this.bucket = bucket;
            this.lastSeenEpochSecond = Instant.now().getEpochSecond();
        }
    }
}
