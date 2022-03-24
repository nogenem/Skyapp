package com.nogenem.skyapp.config;

import com.nogenem.skyapp.controller.SocketIoController;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
@EnableWebSocket
public class SocketIoConfig implements WebSocketConfigurer {
  private final SocketIoController socketIoController;

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(this.socketIoController, "/socket.io/*")
        .addInterceptors(this.socketIoController)
        .setAllowedOrigins("*");
  }
}
