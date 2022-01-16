package com.nogenem.skyapp.config;

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

import lombok.AllArgsConstructor;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  private TokenService tokenService;
  private UserRepository userRepository;

  @Override
  protected void configure(HttpSecurity httpSecurity) throws Exception {
    httpSecurity
        .csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authorizeRequests()
        .antMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()
        .antMatchers(HttpMethod.POST, "/api/auth/signin").permitAll()
        .anyRequest().authenticated()
        .and()
        .addFilterBefore(
            new TokenAuthenticationFilter(tokenService, userRepository),
            UsernamePasswordAuthenticationFilter.class);
  }

}
