/**
 * @file
 * JavaScript behaviors for RateIt integration.
 */

(function ($, Drupal) {

  'use strict';

  // All options can be override using custom data-* attributes.
  // @see https://github.com/gjunge/rateit.js/wiki#options.

  /**
   * Initialize rating element using RateIt.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformRating = {
    attach: function (context) {
      if (!$.fn.rateit) {
        return;
      }

      $(context)
        .find('[data-rateit-backingfld]')
        .once('webform-rating')
        .each(function () {
          var $rateit = $(this);
          var $input = $($rateit.attr('data-rateit-backingfld'));

          // Update the RateIt widget when the input's value has changed.
          // @see webform.states.js
          $input.on('change', function () {
            $rateit.rateit('value', $input.val());
          });

          // Set RateIt widget to be readonly when the input is disabled.
          // @see webform.states.js
          $input.on('webform:disabled', function () {
            $rateit.rateit('readonly', $input.is(':disabled'));
          });
        });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for range element integration.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Enhance HTML5 range element.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformRange = {
    attach: function (context) {
      $(context).find('.form-range[data-range-output]').once('webform-range').each(function () {
        var $element = $(this);
        // Handle browser that don't support the HTML5 range input.
        if (Modernizr.inputtypes.range === false) {
          return;
        }

        var prefix = $element.attr('data-range-output-prefix');
        var suffix = $element.attr('data-range-output-suffix');

        // Display range input's output to the end user.
        var html = '';
        html += '<div class="form-range-output-container">';
        html += (prefix ? '<span class="field-prefix">' + prefix + '</span>' : '');
        html += '<input type="number" min="' + $element.attr('min') + '" max="' + $element.attr('max') + '" step="' + $element.attr('step') + '" class="form-range-output form-number" />';
        html += (suffix ? '<span class="field-suffix">' + suffix + '</span>' : '');
        html += '</div>';

        var height = parseInt($element.outerHeight()) || 24;
        var $outputContainer = $(html);

        // Set the container element's line height which will vertically
        // align the range widget and the output.
        $outputContainer.find('input, span').css({
          height: height + 'px',
          lineHeight: height + 'px'
        });

        var $output = $outputContainer.find('input');
        $output[0].value = $element[0].value;
        $element
          .after($outputContainer)
          .css({float: 'left'});

        // Sync $element and $output.
        $element.on('input', function () {
          $output[0].value = $element[0].value;
        });
        $output.on('input', function () {
          $element[0].value = $output[0].value;
        });
      });
    }
  };

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.password = {
    attach: function attach(context, settings) {
      var $passwordInput = $(context).find('input.js-password-field').once('password');

      if ($passwordInput.length) {
        var translate = settings.password;

        var $passwordInputParent = $passwordInput.parent();
        var $passwordInputParentWrapper = $passwordInputParent.parent();
        var $passwordSuggestions = void 0;

        $passwordInputParent.addClass('password-parent');

        $passwordInputParentWrapper.find('input.js-password-confirm').parent().append('<div aria-live="polite" aria-atomic="true" class="password-confirm js-password-confirm">' + translate.confirmTitle + ' <span></span></div>').addClass('confirm-parent');

        var $confirmInput = $passwordInputParentWrapper.find('input.js-password-confirm');
        var $confirmResult = $passwordInputParentWrapper.find('div.js-password-confirm');
        var $confirmChild = $confirmResult.find('span');

        if (settings.password.showStrengthIndicator) {
          var passwordMeter = '<div class="password-strength"><div class="password-strength__meter"><div class="password-strength__indicator js-password-strength__indicator"></div></div><div aria-live="polite" aria-atomic="true" class="password-strength__title">' + translate.strengthTitle + ' <span class="password-strength__text js-password-strength__text"></span></div></div>';
          $confirmInput.parent().after('<div class="password-suggestions description"></div>');
          $passwordInputParent.append(passwordMeter);
          $passwordSuggestions = $passwordInputParentWrapper.find('div.password-suggestions').hide();
        }

        var passwordCheckMatch = function passwordCheckMatch(confirmInputVal) {
          var success = $passwordInput.val() === confirmInputVal;
          var confirmClass = success ? 'ok' : 'error';

          $confirmChild.html(translate['confirm' + (success ? 'Success' : 'Failure')]).removeClass('ok error').addClass(confirmClass);
        };

        var passwordCheck = function passwordCheck() {
          if (settings.password.showStrengthIndicator) {
            var result = Drupal.evaluatePasswordStrength($passwordInput.val(), settings.password);

            if ($passwordSuggestions.html() !== result.message) {
              $passwordSuggestions.html(result.message);
            }

            $passwordSuggestions.toggle(result.strength !== 100);

            $passwordInputParent.find('.js-password-strength__indicator').css('width', result.strength + '%').removeClass('is-weak is-fair is-good is-strong').addClass(result.indicatorClass);

            $passwordInputParent.find('.js-password-strength__text').html(result.indicatorText);
          }

          if ($confirmInput.val()) {
            passwordCheckMatch($confirmInput.val());
            $confirmResult.css({ visibility: 'visible' });
          } else {
            $confirmResult.css({ visibility: 'hidden' });
          }
        };

        $passwordInput.on('input', passwordCheck);
        $confirmInput.on('input', passwordCheck);
      }
    }
  };

  Drupal.evaluatePasswordStrength = function (password, translate) {
    password = password.trim();
    var indicatorText = void 0;
    var indicatorClass = void 0;
    var weaknesses = 0;
    var strength = 100;
    var msg = [];

    var hasLowercase = /[a-z]/.test(password);
    var hasUppercase = /[A-Z]/.test(password);
    var hasNumbers = /[0-9]/.test(password);
    var hasPunctuation = /[^a-zA-Z0-9]/.test(password);

    var $usernameBox = $('input.username');
    var username = $usernameBox.length > 0 ? $usernameBox.val() : translate.username;

    if (password.length < 12) {
      msg.push(translate.tooShort);
      strength -= (12 - password.length) * 5 + 30;
    }

    if (!hasLowercase) {
      msg.push(translate.addLowerCase);
      weaknesses++;
    }
    if (!hasUppercase) {
      msg.push(translate.addUpperCase);
      weaknesses++;
    }
    if (!hasNumbers) {
      msg.push(translate.addNumbers);
      weaknesses++;
    }
    if (!hasPunctuation) {
      msg.push(translate.addPunctuation);
      weaknesses++;
    }

    switch (weaknesses) {
      case 1:
        strength -= 12.5;
        break;

      case 2:
        strength -= 25;
        break;

      case 3:
        strength -= 40;
        break;

      case 4:
        strength -= 40;
        break;
    }

    if (password !== '' && password.toLowerCase() === username.toLowerCase()) {
      msg.push(translate.sameAsUsername);

      strength = 5;
    }

    if (strength < 60) {
      indicatorText = translate.weak;
      indicatorClass = 'is-weak';
    } else if (strength < 70) {
      indicatorText = translate.fair;
      indicatorClass = 'is-fair';
    } else if (strength < 80) {
      indicatorText = translate.good;
      indicatorClass = 'is-good';
    } else if (strength <= 100) {
      indicatorText = translate.strong;
      indicatorClass = 'is-strong';
    }

    msg = translate.hasWeaknesses + '<ul><li>' + msg.join('</li><li>') + '</li></ul>';

    return {
      strength: strength,
      message: msg,
      indicatorText: indicatorText,
      indicatorClass: indicatorClass
    };
  };
})(jQuery, Drupal, drupalSettings);;