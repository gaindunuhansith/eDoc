package com.edoc.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gateway.rate-limit")
public class RateLimitProperties {

    private boolean enabled = true;
    private String clientHeader = "X-Forwarded-For";
    private int cleanupInterval = 200;
    private long idleTtlSeconds = 1800;

    private Policy defaults = new Policy(20, 40);
    private Policy auth = new Policy(5, 10);
    private Policy payments = new Policy(3, 6);

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getClientHeader() {
        return clientHeader;
    }

    public void setClientHeader(String clientHeader) {
        this.clientHeader = clientHeader;
    }

    public int getCleanupInterval() {
        return cleanupInterval;
    }

    public void setCleanupInterval(int cleanupInterval) {
        this.cleanupInterval = cleanupInterval;
    }

    public long getIdleTtlSeconds() {
        return idleTtlSeconds;
    }

    public void setIdleTtlSeconds(long idleTtlSeconds) {
        this.idleTtlSeconds = idleTtlSeconds;
    }

    public Policy getDefaults() {
        return defaults;
    }

    public void setDefaults(Policy defaults) {
        this.defaults = defaults;
    }

    public Policy getAuth() {
        return auth;
    }

    public void setAuth(Policy auth) {
        this.auth = auth;
    }

    public Policy getPayments() {
        return payments;
    }

    public void setPayments(Policy payments) {
        this.payments = payments;
    }

    public static class Policy {
        private int replenishRate;
        private int burstCapacity;

        public Policy() {
        }

        public Policy(int replenishRate, int burstCapacity) {
            this.replenishRate = replenishRate;
            this.burstCapacity = burstCapacity;
        }

        public int getReplenishRate() {
            return replenishRate;
        }

        public void setReplenishRate(int replenishRate) {
            this.replenishRate = replenishRate;
        }

        public int getBurstCapacity() {
            return burstCapacity;
        }

        public void setBurstCapacity(int burstCapacity) {
            this.burstCapacity = burstCapacity;
        }
    }
}
