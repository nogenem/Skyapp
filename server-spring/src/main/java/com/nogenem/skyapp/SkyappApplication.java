package com.nogenem.skyapp;

import javax.annotation.Resource;

import com.nogenem.skyapp.service.FilesStorageService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import lombok.AllArgsConstructor;

@SpringBootApplication
@AllArgsConstructor
public class SkyappApplication implements CommandLineRunner {

  @Resource
  private final FilesStorageService storageService;

  public static void main(String[] args) {
    SpringApplication.run(SkyappApplication.class, args);
  }

  @Override
  public void run(String... arg) throws Exception {
    this.storageService.init();
  }

  @Bean
  public BCryptPasswordEncoder bCryptPasswordEncoder() {
    return new BCryptPasswordEncoder();
  }

}
