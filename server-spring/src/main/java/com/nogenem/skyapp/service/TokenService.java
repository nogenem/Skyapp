package com.nogenem.skyapp.service;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nogenem.skyapp.model.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TokenService {

  // 2 hours
  private static final int EXPIRES_IN = 2 * 60 * 60 * 1000;
  private static final String TOKEN_CLAIM_KEY = "_id";

  @Value("${env.JWT_SECRET}")
  private String secret;

  @Value("${env.JWT_ISSUER}")
  private String issuer;

  public String generateToken(@NonNull User user, Boolean tokenExpires) {
    Algorithm algorithmHS = Algorithm.HMAC256(secret);
    Date now = new Date();

    JWTCreator.Builder builder = JWT.create()
        .withIssuer(issuer)
        .withClaim(TOKEN_CLAIM_KEY, user.getId())
        .withIssuedAt(now);

    if (tokenExpires) {
      builder.withExpiresAt(new Date(now.getTime() + EXPIRES_IN));
    }

    return builder.sign(algorithmHS);
  }

  public Boolean isValidToken(String token) {
    if (token == null) {
      return false;
    }

    String userId = getUserIdFromToken(token);
    return userId != null && !userId.isEmpty();
  }

  public String getUserIdFromToken(String token) {
    if (token == null) {
      return null;
    }

    try {
      Algorithm algorithm = Algorithm.HMAC256(secret);
      JWTVerifier verifier = JWT.require(algorithm)
          .withIssuer(issuer)
          .build();
      DecodedJWT jwt = verifier.verify(token);

      return jwt.getClaim(TOKEN_CLAIM_KEY).asString();
    } catch (JWTVerificationException exception) {
      log.info("Error while trying to extract `" + TOKEN_CLAIM_KEY + "` from token: " + exception.getMessage());
      return null;
    }
  }

}
