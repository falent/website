/**
 * @file
 * JavaScript behaviors for Select2 integration.
 */

(function ($, Drupal) {

  'use strict';

  // @see https://select2.github.io/options.html
  Drupal.webform = Drupal.webform || {};
  Drupal.webform.select2 = Drupal.webform.select2 || {};
  Drupal.webform.select2.options = Drupal.webform.select2.options || {};

  /**
   * Initialize Select2 support.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformSelect2 = {
    attach: function (context) {
      if (!$.fn.select2) {
        return;
      }

      $(context)
        .find('select.js-webform-select2, .js-webform-select2 select')
        .once('webform-select2')
        // http://stackoverflow.com/questions/14313001/select2-not-calculating-resolved-width-correctly-if-select-is-hidden
        .css('width', '100%')
        .select2(Drupal.webform.select2.options);


      /**
       * ISSUE:
       * Hiding/showing element via #states API cause select2 dropdown to appear in the wrong position.
       *
       * WORKAROUND:
       * Close (aka hide) select2 dropdown when #states API hides or shows an element.
       *
       * Steps to reproduce:
       * - Add custom 'Submit button(s)'
       * - Hide submit button
       * - Save
       * - Open 'Submit button(s)' dialog
       *
       * Dropdown body is positioned incorrectly when dropdownParent isn't statically positioned.
       * @see https://github.com/select2/select2/issues/3303
       */
      $(function () {
        $(document).on('state:visible', function (e) {
          $('select.select2-hidden-accessible').select2('close');
        });
      });

    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for admin pages.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Filter webform autocomplete handler.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformFilterAutocomplete = {
    attach: function (context) {
      $('.webform-filter-form input.form-autocomplete', context).once('webform-autocomplete')
        .each(function () {
          // If input value is an autocomplete match, reset the input to its
          // default value.
          if (/\(([^)]+)\)$/.test(this.value)) {
            this.value = this.defaultValue;
          }

          // From: http://stackoverflow.com/questions/5366068/jquery-ui-autocomplete-submit-onclick-result
          $(this).bind('autocompleteselect', function (event, ui) {
            if (ui.item) {
              $(this).val(ui.item.value);
              this.form.submit();
            }
          });
        });
    }
  };

  /**
   * Allow table rows to be hyperlinked.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformTableRowHref = {
    attach: function (context) {
      // Only attach the click event handler to the entire table and determine
      // which row triggers the event.
      $('.webform-results__table', context).once('webform-results-table').click(function (event) {
        if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
          return true;
        }

        if ($(event.target).parents('a[href]').length) {
          return true;
        }

        var $tr = $(event.target).parents('tr[data-webform-href]');
        if (!$tr.length) {
          return true;
        }

        window.location = $tr.attr('data-webform-href');
        return false;
      });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors to fix dialogs.
 */

(function ($, Drupal) {

  'use strict';

  // @see http://stackoverflow.com/questions/20533487/how-to-ensure-that-ckeditor-has-focus-when-displayed-inside-of-jquery-ui-dialog
  var _allowInteraction = $.ui.dialog.prototype._allowInteraction;
  $.ui.dialog.prototype._allowInteraction = function (event) {
    if ($(event.target).closest('.cke_dialog').length) {
      return true;
    }
    return _allowInteraction.apply(this, arguments);
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for radio buttons.
 *
 * Fix #states and #required for radios buttons.
 *
 * @see Issue #2856795: If radio buttons are required but not filled form is nevertheless submitted.
 * @see Issue #2856315: Conditional Logic - Requiring Radios in a Fieldset.
 * @see Issue #2731991: Setting required on radios marks all options required.
 * @see css/webform.form.css
 * @see /core/misc/states.js
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Attach handler to add .js-webform-radios-fieldset to radios wrapper fieldset.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformRadios = {
    attach: function (context) {
      $('.js-webform-radios', context).closest('fieldset.form-composite').addClass('js-webform-radios-fieldset');
    }
  };

  // Make absolutely sure the below event handlers are triggered after
  // the /core/misc/states.js event handlers by attaching them after DOM load.
  $(function () {
    Drupal.behaviors.webformRadios.attach($(document));

    function setRequired($target, required) {
      if (!$target.hasClass('js-webform-radios-fieldset') && !$target.hasClass('js-webform-radios-other')) {
        return;
      }

      if (required) {
        $target.find('input[type="radio"]').attr({'required': 'required', 'aria-required': 'aria-required'});
        $target.find('legend span').addClass('js-form-required form-required');
      }
      else {
        $target.find('input[type="radio"]').removeAttr('required aria-required');
        $target.find('legend span').removeClass('js-form-required form-required');
      }
    }

    $('.js-webform-radios-fieldset[required="required"], .js-form-type-webform-radios-other[required="required"]').each(function() {
      setRequired($(this), true);
    });

    $(document).on('state:required', function (e) {
      if (e.trigger) {
        setRequired($(e.target), e.value);
      }
    });
  });

})(jQuery, Drupal);
;
