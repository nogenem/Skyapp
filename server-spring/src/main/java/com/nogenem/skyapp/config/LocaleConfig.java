package com.nogenem.skyapp.config;

import java.util.Locale;

import com.transferwise.icu.ICUMessageSource;
import com.transferwise.icu.ICUReloadableResourceBundleMessageSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;

@Configuration
public class LocaleConfig {

  private static final String COOKIE_NAME = "i18next";

  @Bean
  public LocaleResolver localeResolver() {
    CookieLocaleResolver clr = new CookieLocaleResolver();
    clr.setCookieName(COOKIE_NAME);
    clr.setDefaultLocale(Locale.US);
    return clr;
  }

  // @Bean
  // public ResourceBundleMessageSource messageSource() {
  // ResourceBundleMessageSource source = new ResourceBundleMessageSource();
  // source.setBasenames("i18n/messages"); // name of the resource bundle
  // source.setUseCodeAsDefaultMessage(true);
  // source.setDefaultEncoding("UTF-8");
  // return source;
  // }

  @Bean
  public ICUMessageSource icuMessageSource() {
    ICUReloadableResourceBundleMessageSource messageSource = new ICUReloadableResourceBundleMessageSource();
    messageSource.setBasenames("classpath:i18n/messages", "classpath:i18n/errors");
    messageSource.setCacheSeconds(3600);
    messageSource.setUseCodeAsDefaultMessage(true);
    messageSource.setDefaultEncoding("UTF-8");
    return messageSource;
  }

}
