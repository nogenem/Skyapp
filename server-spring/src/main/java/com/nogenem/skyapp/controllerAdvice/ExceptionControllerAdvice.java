package com.nogenem.skyapp.controllerAdvice;

import java.util.List;
import java.util.Locale;
import java.util.Map.Entry;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

import com.nogenem.skyapp.exception.ApiException;
import com.nogenem.skyapp.exception.InternalServerException;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.exception.TranslatableApiException.TranslatableEntry;
import com.transferwise.icu.ICUMessageSource;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.AllArgsConstructor;

@ControllerAdvice
@AllArgsConstructor
public class ExceptionControllerAdvice {

  private final ICUMessageSource messageSource;

  @ExceptionHandler({ ConstraintViolationException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  ApiException onConstraintViolationException(ConstraintViolationException e, Locale locale) {
    TranslatableApiException exception = new TranslatableApiException();

    for (final ConstraintViolation<?> violation : e.getConstraintViolations()) {
      exception.put(violation.getPropertyPath().toString(), violation.getMessage(),
          violation.getExecutableParameters());
    }

    return this.convertToApiException(exception, locale);
  }

  @ExceptionHandler({ MethodArgumentNotValidException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody()
  ApiException onMethodArgumentNotValidException(MethodArgumentNotValidException e, Locale locale) {
    TranslatableApiException exception = new TranslatableApiException();

    for (final FieldError fieldError : e.getBindingResult().getFieldErrors()) {
      exception.put(fieldError.getField(), fieldError.getDefaultMessage(), fieldError.getArguments());
    }

    for (final ObjectError globalError : e.getBindingResult().getGlobalErrors()) {
      exception.put(TranslatableApiException.GLOBAL_KEY, globalError.getDefaultMessage(), globalError.getArguments());
    }

    return this.convertToApiException(exception, locale);
  }

  @ExceptionHandler({ TranslatableApiException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  ApiException onTranslatableApiException(TranslatableApiException e, Locale locale) {
    return this.convertToApiException(e, locale);
  }

  @ExceptionHandler({ ApiException.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody()
  ApiException onApiException(ApiException e) {
    return e;
  }

  @ExceptionHandler({ Exception.class })
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  ApiException onException(Exception e, Locale locale) {
    e.printStackTrace();
    return this.convertToApiException(new InternalServerException(), locale);
  }

  private ApiException convertToApiException(TranslatableApiException e, Locale locale) {
    ApiException exception = new ApiException();

    for (final Entry<String, List<TranslatableEntry>> item : e.getErrors().entrySet()) {
      for (final TranslatableEntry entry : item.getValue()) {
        exception.put(
            item.getKey(),
            messageSource.getMessage(entry.getMessage(), entry.getArgs(), locale));
      }
    }

    return exception;
  }

}
