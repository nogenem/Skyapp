package com.nogenem.skyapp.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import com.nogenem.skyapp.utils.TranslateResolverMethod;
import com.transferwise.icu.ICUMessageSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

import freemarker.core.ParseException;
import freemarker.template.MalformedTemplateNameException;
import freemarker.template.TemplateException;
import freemarker.template.TemplateNotFoundException;
import lombok.NonNull;

@Service
public class MailService {

  private static final int N_THREADS = 20;

  @Value("${spring.mail.username}")
  private String emailUsername;

  private ICUMessageSource messageSource;
  private JavaMailSender mailSender;
  private FreeMarkerConfigurer freeMarker;
  private final ScheduledExecutorService quickService = Executors.newScheduledThreadPool(N_THREADS);

  public MailService(JavaMailSender mailSender, FreeMarkerConfigurer freeMarker, ICUMessageSource messageSource) {
    this.mailSender = mailSender;
    this.freeMarker = freeMarker;
    this.messageSource = messageSource;
  }

  public void sendSimpleTextMail(String toEmail, String subject, String body) {
    SimpleMailMessage mail = new SimpleMailMessage();
    mail.setTo(toEmail);
    mail.setSubject(subject);
    mail.setFrom(this.getFromEmail());
    mail.setText(body);

    quickService.submit(() -> {
      try {
        mailSender.send(mail);
      } catch (Exception e) {
        e.printStackTrace();
      }
    });
  }

  public void sendSimpleHtmlMail(String toEmail, String subject, String body) throws MessagingException {
    MimeMessage mail = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(mail, true, "UTF-8");

    helper.setTo(toEmail);
    helper.setSubject(subject);
    helper.setFrom(this.getFromEmail());
    helper.setText(body, true);

    quickService.submit(() -> {
      try {
        mailSender.send(mail);
      } catch (Exception e) {
        e.printStackTrace();
      }
    });
  }

  public void sendConfirmationEmail(@NonNull String toEmail, @NonNull String token, @NonNull String origin)
      throws TemplateNotFoundException, MalformedTemplateNameException,
      ParseException, MessagingException, IOException, TemplateException {

    Object[] args = null;
    String subject = messageSource.getMessage("messages.welcome_to_skyapp", args, LocaleContextHolder.getLocale());

    Map<String, Object> model = new HashMap<>();
    model.put("url", origin + "/confirmation/" + token);

    this.sendSimpleHtmlMail(toEmail, subject, this.geContentFromTemplate("confirmation-email.flth", model));
  }

  public void sendResetPasswordEmail(@NonNull String toEmail, @NonNull String token, @NonNull String origin)
      throws TemplateNotFoundException, MalformedTemplateNameException,
      ParseException, MessagingException, IOException, TemplateException {

    Object[] args = null;
    String subject = messageSource.getMessage("messages.reset_password", args, LocaleContextHolder.getLocale());

    Map<String, Object> model = new HashMap<>();
    model.put("url", origin + "/reset_password/" + token);

    this.sendSimpleHtmlMail(toEmail, subject, this.geContentFromTemplate("reset_password-email.flth", model));
  }

  private String geContentFromTemplate(String templatePath, Map<String, Object> model)
      throws TemplateNotFoundException, MalformedTemplateNameException, ParseException, IOException, TemplateException {

    model.put("t", new TranslateResolverMethod(messageSource, LocaleContextHolder.getLocale()));

    StringBuffer content = new StringBuffer();
    content.append(FreeMarkerTemplateUtils
        .processTemplateIntoString(freeMarker.getConfiguration().getTemplate(templatePath), model));

    return content.toString();
  }

  private String getFromEmail() {
    return String.format("%s <%s>", emailUsername, emailUsername);
  }

}
