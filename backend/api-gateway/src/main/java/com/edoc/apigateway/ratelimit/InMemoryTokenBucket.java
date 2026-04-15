package com.edoc.apigateway.ratelimit;

class InMemoryTokenBucket {

    private final int replenishRate;
    private final int burstCapacity;

    private double tokens;
    private long lastRefillNanos;

    InMemoryTokenBucket(int replenishRate, int burstCapacity) {
        this.replenishRate = Math.max(1, replenishRate);
        this.burstCapacity = Math.max(1, burstCapacity);
        this.tokens = this.burstCapacity;
        this.lastRefillNanos = System.nanoTime();
    }

    synchronized boolean tryConsume() {
        refill();
        if (tokens < 1d) {
            return false;
        }
        tokens -= 1d;
        return true;
    }

    private void refill() {
        long now = System.nanoTime();
        long elapsedNanos = now - lastRefillNanos;
        if (elapsedNanos <= 0L) {
            return;
        }

        double elapsedSeconds = elapsedNanos / 1_000_000_000d;
        double replenished = elapsedSeconds * replenishRate;
        tokens = Math.min(burstCapacity, tokens + replenished);
        lastRefillNanos = now;
    }
}
