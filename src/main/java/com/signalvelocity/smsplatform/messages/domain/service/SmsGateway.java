package com.signalvelocity.smsplatform.messages.domain.service;

public interface SmsGateway {

    SmsGatewayResult send(String phoneNumber, String content);
}
