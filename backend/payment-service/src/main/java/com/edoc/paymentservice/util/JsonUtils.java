package com.edoc.paymentservice.util;

import java.util.Map;

public final class JsonUtils {

    private JsonUtils() {}

    public static String toJson(Map<String, String> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }

        StringBuilder builder = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (!first) {
                builder.append(',');
            }
            builder.append('"')
                    .append(escape(entry.getKey()))
                    .append('"')
                    .append(':')
                    .append('"')
                    .append(escape(entry.getValue()))
                    .append('"');
            first = false;
        }
        builder.append('}');
        return builder.toString();
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
