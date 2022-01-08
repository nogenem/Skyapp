package com.nogenem.skyapp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.nogenem.skyapp.validator.PasswordMatchValidator;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordMatchValidator.class)
@Documented
public @interface PasswordMatch {
  // TODO: Add i18n
  String message() default "Passwords must match";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
