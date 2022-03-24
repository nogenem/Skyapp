package com.nogenem.skyapp.controllerAdvice;

import java.util.Locale;

import com.nogenem.skyapp.response.ApiResponse;
import com.transferwise.icu.ICUMessageSource;

import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import lombok.AllArgsConstructor;

@ControllerAdvice
@AllArgsConstructor
public class ApiResponseControllerAdvice implements ResponseBodyAdvice<ApiResponse> {

  private final ICUMessageSource messageSource;

  @Override
  public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
    return ApiResponse.class.isAssignableFrom(returnType.getParameterType());
  }

  @Override
  public ApiResponse beforeBodyWrite(ApiResponse body, MethodParameter returnType, MediaType selectedContentType,
      Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request,
      ServerHttpResponse response) {

    Locale locale = LocaleContextHolder.getLocale();
    body.setMessage(this.messageSource.getMessage(body.getMessage(), body.getArgs(), locale));

    return body;
  }

}
