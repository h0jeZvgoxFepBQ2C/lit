//= require ./mousetrap.js
"use strict";

if(!window.Lit) {
  window.Lit = {
    frontendEditor: {
      create: null,
      remove: null,
      removeLitForm: function(){
        $('#litForm').remove();
      },
      submitForm: function(elem, val, update_path){
        $.ajax({
          type: 'PATCH',
          dataType: 'json',
          url: update_path,
          data: { 'localization[translated_value]': val },
          success: function(data){
            elem.html( data.html );
            elem.attr('contentEditable', false);
            console.log('saved ' + elem.data('key'));
          },
          error: function(){
            console.error('cannot save ' + elem.data('key'));
            alert('cannot save ' + elem.data('key'));
          }
        });
      },
      replaceWithForm: function(elem, value, update_path){
        window.Lit.frontendEditor.removeLitForm();
        var $this = $(elem);
        $this.attr('contenteditable', true);
        if(value)
          $this.html(value);
        $this.focus()
        $this.on('blur', function(){
          window.Lit.frontendEditor.submitForm($this, $this.html(), update_path);
          window.Lit.frontendEditor.removeLitForm();
        });
      }
    }
  }
}

(function() {
  var $btn, $elem;
  var buildLocalizationForm, getLocalizationPath, getLocalizationDetails;

  buildLocalizationForm = function(e){
    e.stopPropagation();

    var $this = $(this);

    if($this.is(':focus'))
      return false;

    var meta = $('meta[name="lit-url-base"]');

    if(meta.length > 0)
      getLocalizationPath($this, meta);
    else
      console.error('cannot find lit base url');

    return false;
  };

  getLocalizationPath = function(elem, metaElem) {
    $.getJSON(metaElem.attr('value'),
      { locale: elem.data('locale'),
        key: elem.data('key') },
      function(data){
        getLocalizationDetails(elem, data.path);
      }
    );
  };

  getLocalizationDetails = function(elem, path){
    $.getJSON(path, {},
      function(data){
        window.Lit.frontendEditor.replaceWithForm(elem, data.value, path);
      }
    );
  };

  $(document).ready(function(){
    $('<div id="lit_button_wrapper" />').appendTo('body');
    $btn = $('#lit_button_wrapper').text('Enable / disable lit highlight');
    $btn.on('click', function(){
      window.Lit.frontendEditor.removeLitForm();
      if($btn.hasClass('lit-highlight-enabled')){
        $('.lit-key-generic').removeClass('lit-key-highlight').off('click.lit');
        $btn.removeClass('lit-highlight-enabled');
        $('.lit-key-generic').each(function(_, elem){
          $elem = $(elem);
          $elem.attr('title', $elem.data('old-title') || '');
        });
      }else{
        $('.lit-key-generic').addClass('lit-key-highlight').on('click.lit', buildLocalizationForm);
        $btn.addClass('lit-highlight-enabled');
        $('.lit-key-generic').each(function(_, elem){
          $elem = $(elem);
          $elem.data('old-title', $elem.attr('title'));
          $elem.attr('title', $elem.data('key'));
        });
      }
    });
    $('.lit-translations-info .lit-open-button').click(function(){
      $('.lit-translations-info').toggleClass('collapsed expanded');
    });
    $('.lit-translations-info .lit-close-button').click(function(){
      $('.lit-translations-info').toggleClass('collapsed expanded');
    });
  });

}).call(this);

