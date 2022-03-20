package com.nogenem.skyapp.config;

import java.util.Collections;

import com.nogenem.skyapp.filters.TokenAuthenticationFilter;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.service.TokenService;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import lombok.AllArgsConstructor;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  private TokenService tokenService;
  private UserRepository userRepository;

  @Override
  protected void configure(HttpSecurity httpSecurity) throws Exception {
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    corsConfiguration.applyPermitDefaultValues();
    corsConfiguration.addAllowedMethod(HttpMethod.PATCH);
    corsConfiguration.addAllowedMethod(HttpMethod.PUT);
    corsConfiguration.setAllowedOriginPatterns(Collections.singletonList("*"));
    corsConfiguration.setAllowCredentials(true);

    httpSecurity
        .cors()
        .configurationSource(request -> corsConfiguration)
        .and()
        .csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authorizeRequests()
        .antMatchers("/uploads/*").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/signin").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/confirmation").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/resend_confirmation_email").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/validate_token").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/forgot_password").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/reset_password").permitAll()
        .antMatchers("/socket.io/*").permitAll()
        .anyRequest().authenticated()
        .and()
        .addFilterBefore(
            new TokenAuthenticationFilter(tokenService, userRepository),
            UsernamePasswordAuthenticationFilter.class);
  }

}
