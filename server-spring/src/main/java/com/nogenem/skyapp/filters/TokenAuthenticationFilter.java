package com.nogenem.skyapp.filters;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.service.TokenService;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@AllArgsConstructor
@Slf4j
public class TokenAuthenticationFilter extends OncePerRequestFilter {

  private static final String TOKEN_HEADER_KEY = "Authorization";
  private static final String TOKEN_HEADER_KEY_PREFIX = "Bearer ";

  private final TokenService tokenService;
  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String token = this.getTokenFromHeader(request);
    String userId = this.tokenService.getUserIdFromToken(token);

    if (userId != null && !userId.isEmpty()) {
      authenticate(userId);
    }

    filterChain.doFilter(request, response);
  }

  private String getTokenFromHeader(HttpServletRequest request) {
    String token = request.getHeader(TOKEN_HEADER_KEY);

    if (token == null || token.isEmpty() || !token.startsWith(TOKEN_HEADER_KEY_PREFIX)) {
      return null;
    }

    return token.substring(7, token.length());
  }

  private void authenticate(String userId) {
    Optional<User> optionalUser = this.userRepository.findById(userId);

    if (optionalUser.isPresent()) {
      User user = optionalUser.get();

      UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
          user, null, Collections.emptyList());
      SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
    } else {
      log.info("User id not found in database while trying to authenticate with a token: " + userId);
    }
  }

}
