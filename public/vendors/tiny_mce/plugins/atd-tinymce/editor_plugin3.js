/*
 * atd.core.js - A building block to create a front-end for AtD
 * Author      : Raphael Mudge, Automattic; Daniel Naber, LanguageTool.org
 * License     : LGPL
 * Project     : http://www.afterthedeadline.com/developers.slp
 * Contact     : raffi@automattic.com
 *
 * Note: this has been simplified for use with LanguageTool - it now assumes there's no markup 
 * anymore in the text field (not even bold etc)!
 */

/* EXPORTED_SYMBOLS is set so this file can be a JavaScript Module */
var EXPORTED_SYMBOLS = ['AtDCore'];

//
// TODO:
// 1. "ignore this error" only works until page reload
// 2. Ctrl-Z (undo) makes the error markers go away
//

var IS_TOUCH = "ontouchstart" in window;

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

function AtDCore() {
    /* Localized strings */
    this.i18n = {};
    /* We have to mis-use an existing valid HTML attribute to get our meta information
     * about errors in the text: */
    this.surrogateAttribute = "onkeypress";
    this.surrogateAttributeDelimiter = "---#---";
    this.ignoredRulesIds = [];
    this.ignoredSpellingErrors = [];
}

/*
 * Internationalization Functions
 */

AtDCore.prototype.getLang = function(key, defaultk) {
    if (this.i18n[key] == undefined)
        return defaultk;

    return this.i18n[key];
};

AtDCore.prototype.addI18n = function(localizations) {
    this.i18n = localizations;
};

/*
 * Setters
 */

AtDCore.prototype.processJSON = function(responseJSON) {
    var json = jQuery.parseJSON(responseJSON);
    var incompleteResults = json.warnings && json.warnings.incompleteResults;
    var incompleteResultsReason = json.warnings && json.warnings.incompleteResults ? json.warnings.incompleteResultsReason : null;
    this.suggestions = [];
    for (var key in json.matches) {
        var match = json.matches[key];
        var suggestion = {};
        suggestion["description"] = match.message;
        suggestion["suggestions"] = [];
        var suggestions = [];
        for (var k = 0; k < match.replacements.length; k++) {
            var repl = match.replacements[k];
            suggestions.push(repl.value);
        }
        suggestion["suggestions"] = suggestions.join("#");
        suggestion["sentence"]    = match.sentence;
        suggestion["offset"]      = match.offset;
        suggestion["errorlength"] = match.length;
        suggestion["type"]        = match.rule.category.name;
        suggestion["typeid"]      = match.rule.category.id;
        suggestion["typeName"]    = match.type && match.type.typeName ? match.type.typeName : "";
        suggestion["ruleid"]      = match.rule.id;
        suggestion["subid"]       = match.rule.subId;
        suggestion["its20type"]   = match.rule.issueType;
        var urls = match.rule.urls;
        if (urls && urls.length > 0) {
            if (urls[0].value) {
                suggestion["moreinfo"] = urls[0].value;
            } else {
                suggestion["moreinfo"] = urls[0];  //TODO: remove this case, it's for an old API version
            }
        }
        this.suggestions.push(suggestion);
    }
    return {suggestions: this.suggestions, incompleteResults: incompleteResults, incompleteResultsReason: incompleteResultsReason,
            hiddenMatches: json.hiddenMatches ? json.hiddenMatches.length : 0};
};

AtDCore.prototype.findSuggestion = function(element) {
    var metaInfo = element.getAttribute(this.surrogateAttribute);
    var errorDescription = {};
    errorDescription["id"] = this.getSurrogatePart(metaInfo, 'id');
    errorDescription["subid"] = this.getSurrogatePart(metaInfo, 'subid');
    errorDescription["description"] = this.getSurrogatePart(metaInfo, 'description');
    errorDescription["coveredtext"] = this.getSurrogatePart(metaInfo, 'coveredtext');
    errorDescription["sentence"] = this.getSurrogatePart(metaInfo, 'sentence');
    var suggestions = this.getSurrogatePart(metaInfo, 'suggestions');
    if (suggestions) {
        errorDescription["suggestions"] = suggestions.split("#");
    } else {
        errorDescription["suggestions"] = "";
    }
    var url = this.getSurrogatePart(metaInfo, 'url');
    if (url) {
        errorDescription["moreinfo"] = url;
    }
    return errorDescription;
};

/* 
 * code to manage highlighting of errors
 */
AtDCore.prototype.markMyWords = function() {
    var ed = tinyMCE.activeEditor;
    var textWithCursor = this.getPlainTextWithCursorMarker();
    var cursorPos = textWithCursor.indexOf("\ufeff");
    var newText = this.getPlainText();
    
    newText = newText.replace(/</g, "\ue001");
    newText = newText.replace(/>/g, "\ue002");
    
    var previousSpanStart = -1;
    // iterate backwards as we change the text and thus modify positions:
    for (var suggestionIndex = this.suggestions.length-1; suggestionIndex >= 0; suggestionIndex--) {
        var suggestion = this.suggestions[suggestionIndex];
        if (!suggestion.used) {
            var spanStart = suggestion.offset;
            var spanEnd = spanStart + suggestion.errorlength;
            if (previousSpanStart != -1 && spanEnd > previousSpanStart) {
                // overlapping errors - these are not supported by our underline approach,
                // as we would need overlapping <span>s for that, so skip the error:
                continue;
            }
            previousSpanStart = spanStart;
            
            var ruleId = suggestion.ruleid;
            if (this.ignoredRulesIds.indexOf(ruleId) !== -1) {
                continue;
            }
            var cssName;
            if (suggestion.typeName === "Hint") {
                cssName = "hiddenSuggestion";
            } else if (suggestion.typeid === 'DIFFICULT_WORDS' /* DE (Leichte Sprache) */ || suggestion.typeName === "UnknownWord" || ruleId.indexOf("SPELLER_RULE") >= 0 || ruleId.indexOf("MORFOLOGIK_RULE") == 0 || ruleId == "HUNSPELL_NO_SUGGEST_RULE" || ruleId == "HUNSPELL_RULE" || ruleId == "FR_SPELLING_RULE") {
                cssName = "hiddenSpellError";
            } else if (suggestion.its20type === 'style' || suggestion.its20type === 'locale-violation' || suggestion.its20type === 'register') {
                cssName = "hiddenSuggestion";
            } else {
                cssName = "hiddenGrammarError";
            }
            var delim = this.surrogateAttributeDelimiter;
            var coveredText = newText.substring(spanStart, spanEnd);
            if (this.ignoredSpellingErrors.indexOf(coveredText) !== -1) {
                continue;
            }
            var metaInfo = ruleId + delim + suggestion.subid + delim + suggestion.description + delim + suggestion.sentence + delim + suggestion.suggestions
              + delim + coveredText;
            if (suggestion.moreinfo) {
                metaInfo += delim + suggestion.moreinfo;
            }
            metaInfo = metaInfo.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
                    .replace(/</g, "&lt;").replace(/>/g, "&gt;");  // escape HTML
            newText = newText.substring(0, spanStart)
                    + '<span ' + this.surrogateAttribute + '="' + metaInfo + '" class="' + cssName + '">'
                    + newText.substring(spanStart, spanEnd)
                    + '</span>'
                    + newText.substring(spanEnd);
            suggestion.used = true;
        }
    }
    
    // now insert a span into the location of the original cursor position,
    // only considering real text content of course:
    newText = this._insertCursorSpan(newText, cursorPos);
    
    newText = newText.replace(/^\n/, "");
    newText = newText.replace(/^\n/, "");
    newText = newText.replace(/\n/g, "<br/>");
    newText = newText.replace(/\ue001/g, '&lt;');
    newText = newText.replace(/\ue002/g, '&gt;');

    ed.setContent(newText);
    // now place the cursor where it was:
    ed.selection.select(ed.dom.select('span#caret_pos_holder')[0]);
    ed.dom.remove(ed.dom.select('span#caret_pos_holder')[0]);
};

AtDCore.prototype._insertCursorSpan = function(text, cursorPos) {
    var newTextParts = text.split(/([<>])/);
    var inTag = 0;
    var textPos = 0;
    var stringPos = 0;
    for (var i = 0; i < newTextParts.length; i++) {
        if (newTextParts[i] == "<" || newTextParts[i] == ">") {
            if (newTextParts[i] == "<") {
                inTag++;
            } else {
                inTag--;
            }
        } else if (inTag == 0) {
            var partLength = newTextParts[i].length;
            if (cursorPos >= textPos && cursorPos <= textPos + partLength) {
                var relativePos = cursorPos - textPos;
                text = text.insert(stringPos + relativePos, "<span id='caret_pos_holder'></span>");
                break;
            }
            textPos += partLength;
        }
        stringPos += newTextParts[i].length;
    }
    return text;
};

AtDCore.prototype.getSurrogatePart = function(surrogateString, part) {
    var parts = surrogateString.split(this.surrogateAttributeDelimiter);
    if (part == 'id') {
        return parts[0];
    } else if (part == 'subid') {
        return parts[1];
    } else if (part == 'description') {
        return parts[2];
    } else if (part == 'sentence') {
        return parts[3];
    } else if (part == 'suggestions') {
        return parts[4];
    } else if (part == 'coveredtext') {
        return parts[5];
    } else if (part == 'url' && parts.length >= 6) {
        return parts[6];
    }
    console.log("No part '" + part + "' found in surrogateString: " + surrogateString);
    return null;
};

AtDCore.prototype.getPlainTextWithCursorMarker = function() {
    return this._getPlainText(false);
};

AtDCore.prototype.getPlainText = function() {
    return this._getPlainText(true);
};

AtDCore.prototype._getPlainText = function(removeCursor) {
    var plainText = tinyMCE.activeEditor.getContent({ format: 'raw' })
            .replace(/^<p>/, "")
            .replace(/<p>/g, "\n\n")
            .replace(/<br>/g, "\n")
            .replace(/<br\s*\/>/g, "\n")
            .replace(/<.*?>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">") 
            .replace(/&nbsp;/g, " ");  // see issue #10
    if (removeCursor) {
        plainText = plainText.replace(/\ufeff/g, "");  // feff = 65279 = cursor code
    }
    return plainText;
};

AtDCore.prototype.removeWords = function(node, w) {
    var count = 0;
    var parent = this;

    this.map(this.findSpans(node).reverse(), function(n) {
        if (n && (parent.isMarkedNode(n) || parent.hasClass(n, 'mceItemHidden') || parent.isEmptySpan(n)) ) {
            if (n.innerHTML == '&nbsp;') {
                var nnode = document.createTextNode(' '); /* hax0r */
                parent.replaceWith(n, nnode);
            } else if (!w || n.innerHTML == w) {
                parent.removeParent(n);
                count++;
            }
        }
    });

    return count;
};

AtDCore.prototype.removeWordsByRuleId = function(node, ruleId, coveredText) {
    var count = 0;
    var parent = this;

    this.map(this.findSpans(node).reverse(), function(n) {
        if (n && (parent.isMarkedNode(n) || parent.hasClass(n, 'mceItemHidden') || parent.isEmptySpan(n)) ) {
            if (n.innerHTML == '&nbsp;') {
                var nnode = document.createTextNode(' '); /* hax0r */
                parent.replaceWith(n, nnode);
            } else {
                var surrogate = n.getAttribute(parent.surrogateAttribute);
                var textIsRelevant = coveredText ? parent.getSurrogatePart(surrogate, 'coveredtext') == coveredText : true;
                if (textIsRelevant && (surrogate && parent.getSurrogatePart(surrogate, 'id') == ruleId)) {
                    parent.removeParent(n);
                    count++;
                }
            }
        }
    });

    return count;
};

AtDCore.prototype.isEmptySpan = function(node) {
    return (this.getAttrib(node, 'class') == "" && this.getAttrib(node, 'style') == "" && this.getAttrib(node, 'id') == "" && !this.hasClass(node, 'Apple-style-span') && this.getAttrib(node, 'mce_name') == "");
};

AtDCore.prototype.isMarkedNode = function(node) {
    return (this.hasClass(node, 'hiddenGrammarError') || this.hasClass(node, 'hiddenSpellError') || this.hasClass(node, 'hiddenSuggestion'));
};

/*
 * Context Menu Helpers
 */
AtDCore.prototype.applySuggestion = function(element, suggestion) {
    if (suggestion == '(omit)') {
        this.remove(element);
    }
    else {
        var node = this.create(suggestion);
        this.replaceWith(element, node);
        this.removeParent(node);
    }
};

/* 
 * Check for an error
 */
AtDCore.prototype.hasErrorMessage = function(xmlr) {
    return (xmlr != undefined && xmlr.getElementsByTagName('message').item(0) != null);
};

AtDCore.prototype.getErrorMessage = function(xmlr) {
    return xmlr.getElementsByTagName('message').item(0);
};

/* this should always be an error, alas... not practical */
AtDCore.prototype.isIE = function() {
    return navigator.appName == 'Microsoft Internet Explorer';
};
/*
 * TinyMCE Writing Improvement Tool Plugin 
 * Original Author: Raphael Mudge (raffi@automattic.com)
 * Heavily modified by Daniel Naber for LanguageTool (http://www.languagetool.org)
 *
 * http://www.languagetool.org
 * http://www.afterthedeadline.com
 *
 * Distributed under the LGPL
 *
 * Derived from:
 *    $Id: editor_plugin_src.js 425 2007-11-21 15:17:39Z spocke $
 *
 *    @author Moxiecode
 *    @copyright Copyright (C) 2004-2008, Moxiecode Systems AB, All rights reserved.
 *
 *    Moxiecode Spell Checker plugin released under the LGPL with TinyMCE
 */

(function() 
{
   var JSONRequest = tinymce.util.JSONRequest, each = tinymce.each, DOM = tinymce.DOM;
   var maxTextLength = 20000;
   var userHasPastedText = false;

   var pasteId = null;
   function newPasteId() { 
       pasteId = Math.round(Math.random() * 99999) + ':' + Date.now();
       return pasteId;
    };

   tinymce.create('tinymce.plugins.AfterTheDeadlinePlugin', 
   {
      getInfo : function() 
      {
         return({
            longname :  'After The Deadline / LanguageTool',
            author :    'Raphael Mudge, Daniel Naber',
            authorurl : 'http://blog.afterthedeadline.com',
            infourl :   'http://www.afterthedeadline.com',
            version :   tinymce.majorVersion + "." + tinymce.minorVersion
         });
      },

      /* initializes the functions used by the AtD Core UI Module */
      initAtDCore : function(editor, plugin)
      {
         var core = new AtDCore();

         core.map = each;

         core.getAttrib = function(node, key) 
         { 
            return editor.dom.getAttrib(node, key); 
         };

         core.findSpans = function(parent) 
         {
            if (parent == undefined)
               return editor.dom.select('span');
            else
               return editor.dom.select('span', parent);
         };

         core.hasClass = function(node, className) 
         { 
            return editor.dom.hasClass(node, className); 
         };
         
         core.contents = function(node) 
         { 
            return node.childNodes;  
         };

         core.replaceWith = function(old_node, new_node) 
         { 
            return editor.dom.replace(new_node, old_node); 
         };

         core.create = function(node_html) 
         { 
            return editor.dom.create('span', { 'class': 'mceItemHidden' }, node_html);
         };

         core.removeParent = function(node) 
         {
            editor.dom.remove(node, 1);
            return node;
         };

         core.remove = function(node) 
         { 
            editor.dom.remove(node); 
         };

         core.getLang = function(key, defaultk) 
         { 
             return editor.getLang("AtD." + key, defaultk);
         };

         return core;
      },
 
      /* called when the plugin is initialized */
      init : function(ed, url) 
      {
         var t = this;
         var plugin  = this;
         var editor  = ed;
         var core = this.initAtDCore(editor, plugin);

         this.url    = url;
         this.editor = ed;
         this.menuVisible = false;
         this.selectedTarget = null;
         ed.core = core;

         /* add a command to request a document check and process the results. */
         editor.addCommand('mceWritingImprovementTool', function(languageCode)
         {
             
            if (plugin.menuVisible) {
              plugin._menu.hideMenu();
            }

            /* checks if a global var for click stats exists and increments it if it does... */
            if (typeof AtD_proofread_click_count != "undefined")
               AtD_proofread_click_count++;

            /* create the nifty spinny thing that says "hizzo, I'm doing something fo realz" */
            plugin.editor.setProgressState(1);
            t._logEventLocally();

            /* remove the previous errors */
            plugin._removeWords();

            /* send request to our service */
            var textContent = plugin.editor.core.getPlainText();
            plugin.sendRequest('', textContent, languageCode, function(data, request, jqXHR)
            {
               /* turn off the spinning thingie */
               plugin.editor.setProgressState(0);
               document.checkform._action_checkText.disabled = false;

               $('#feedbackErrorMessage').html("");  // no severe errors, so clear that error area

               var results = core.processJSON(jqXHR.responseText);
               var json = jQuery.parseJSON(jqXHR.responseText);
               if (json && json.software) {
                  console.log("LT version used: " + json.software.version + " (" + json.software.buildDate + ")");
               }
               if (json && json.matches) {
                   if (json['hiddenMatches']) {
                       console.log("matches: " + json.matches.length + ", hiddenMatches: " + json.hiddenMatches.length);
                       //$('#matchCountArea').text(json.matches.length + " matches");
                   } else {
                       console.log("matches: " + json.matches.length);
                       //$('#matchCountArea').text("");
                   }
               }
               if (languageCode === "auto") {
                  var detectedLang = json.language.name;
                  /*var langDiv = $("#lang");
                  langDiv.find('option[value="auto"]').remove();
                  langDiv.prepend($("<option selected/>").val("auto").text("Auto-detected: " + detectedLang));
                  langDiv.dropkick('refresh');*/
                  $('#feedbackMessage').html(t._getTranslation('editor_detected_language') + " " + detectedLang);
                  $('#detectedLanguage').text(json.language.code);
               }

               if (results.suggestions.length == 0) {
                  var noErrorsText = t._getTranslation('editor_no_errors');
                  if (languageCode === "auto") {
                     noErrorsText += " " + t._getTranslation('editor_detected_language') + " " + detectedLang;
                  }
                  $('#feedbackMessage').html(noErrorsText);
               }
               else {
                  plugin.markMyWords();
                  ed.suggestions = results.suggestions; 
               }

               if (json.language.detectedLanguage && json.language.code !== json.language.detectedLanguage.code && textContent.length > 3) {
                   var detectedLangShort = json.language.detectedLanguage.code.replace(/-..$/, "");
                   var usedLangShort = json.language.code.replace(/-..$/, "");
                   if (detectedLangShort !== usedLangShort && json.language.code !== "de-DE-x-simple-language") {
                       var fullLangCode = json.language.detectedLanguage.code;
                       var langCode = fullLangCode.replace(/-.*/, "");
                       var translatedLang = t._getTranslation('langs')[langCode];
                       if (translatedLang) {
                           $('#feedbackErrorMessage').html("<div id='severeError'>" + t._getTranslation('editor_detected_language') + " " +
                               " <a href='#' onclick=\"return switchLanguage('" + fullLangCode + "')\">" +
                               t._getTranslation('editor_detected_language_switch').replace(/:language/, translatedLang) + "</a></div>");
                       }
                   }
               } else if (results.incompleteResults) {
                   if (results.incompleteResultsReason) {
                       $('#feedbackErrorMessage').html("<div id='severeError'>" + $('<div/>').text(results.incompleteResultsReason).html() + "</div>");
                   } else {
                       // old server code might not return a reason:
                       $('#feedbackErrorMessage').html("<div id='severeError'>These results may be incomplete due to a server timeout.</div>");
                   }
                   t._trackEvent('CheckError', 'ErrorWithException', "Incomplete Results");
               } else {
                   $('#feedbackErrorMessage').html("");
               }
               if (results.hiddenMatches > 0) {
                   if (lang === "auto") {
                       lang = json.language.code;
                   }
                   var startText = t._getTranslation('premium_warning1');
                   if (startText.indexOf("ERROR") === -1) {  // don't show hint if we don't have translation of the message
                       if (results.hiddenMatches > 1) {
                           startText = results.hiddenMatches + " " + t._getTranslation('premium_warning1_plural');
                       }
                       $('#feedbackPremiumMessage').show();
                       var warnStyle = "premiumWarning1";
                       if (Math.random() > 0.5) {
                         warnStyle = "premiumWarning2";
                       }
                       t._trackEvent('PremiumHintShown', warnStyle);
                       //console.log("warnStyle", warnStyle);
                       $('#feedbackPremiumMessage').html("<div id=\"" + warnStyle + "\">" + startText + " " +
                           t._getTranslation('premium_warning2') + "</div>");
                       t._trackEvent('PremiumMatchesHiddenCount', results.hiddenMatches);
                       t._trackEvent('PremiumMatchesHidden', userHasPastedText ? "UserText" : "DemoText");
                       $('#premiumWarning1').click(function() {
                           document.cookie = "premiumHint=true;max-age=86400;path=/";  // 86.400 = 1 day
                           t._trackEvent('PremiumHintClicked', warnStyle);
                       });
                       $('#premiumWarning2').click(function() {
                           document.cookie = "premiumHint=true;max-age=86400;path=/";  // 86.400 = 1 day
                           t._trackEvent('PremiumHintClicked', warnStyle);
                       });
                   }
               } else {
                   $('#feedbackPremiumMessage').hide();
                   t._trackEvent('PremiumMatchesHiddenCount', 'none');
                   t._trackEvent('NoPremiumMatchesHidden');
               }
            });
         });
          
         /* load cascading style sheet for this plugin */
          editor.onInit.add(function() 
         {
            /* loading the content.css file, why? I have no clue */
            if (editor.settings.content_css !== false)
            {
               editor.dom.loadCSS(editor.getParam("languagetool_css_url", url + '/css/content.css?v4'));
            }
            
            editor.getBody().setAttribute("data-gramm", "false");
            editor.dom.events.bind(editor.getBody(), "input", function(e) {
                var doc = editor.getBody().ownerDocument;
                var win = doc.defaultView;
                var selection = win.getSelection();

                if (!selection) {
                    return;
                }
                var range = selection.getRangeAt(0);
                if (!range) {
                    return;
                }
                var error = range.startContainer.parentNode;
                var oldOffset = range.startOffset;
                var container = range.startContainer;
                if (error) {
                    oldOffset = range.endOffset;
                    container = range.endContainer;
                    error = range.endContainer.parentNode;
                }

                if (!error) {
                    return;
                }

                // Chrome seems to create elements with inline styles that look like ".error" elements
                var hasBackgroundColor = error.nodeName === "SPAN" && error.getAttribute("style");
                if (!hasBackgroundColor && !error.className.match(/hidden/)) {
                    return;
                }

                while (error.firstChild) {
                    error.parentNode.insertBefore(error.firstChild, error);
                }

                error.parentNode.removeChild(error);
                range = doc.createRange();
                try {
                    range.setStart(container, oldOffset);
                    range.setEnd(container, oldOffset);
                    var selection = win.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                } catch(e) {}
            });

             if (IS_TOUCH) {
                 var currentTarget = null;
                 var touchTimeout = null;
                 editor.dom.events.bind(editor.getBody(), "touchstart", function(e) {
                     currentTarget = e.target;
                     clearTimeout(touchTimeout);
                     touchTimeout = setTimeout(function() {
                         currentTarget = null;
                     }, 400);

                 });
                 editor.dom.events.bind(editor.getBody(), "touchend", function(e) {
                     clearTimeout(touchTimeout);
                     if (currentTarget && currentTarget === e.target) {
                         plugin._showMenu(editor, e);
                     }
                     currentTarget = null;
                 });
             }
         });

         /* again showing a menu, I have no clue what */
         if (!IS_TOUCH) {
             editor.onClick.add(plugin._showMenu, plugin);
         }
         
         editor.onPaste.add(function(editor, ev) {
             t._trackEvent('PasteText');
             $('#matchCountArea').text("");
             userHasPastedText = true;
             newPasteId();
             /*if (document.cookie.indexOf("addonSurveyShown=true") === -1) {
                 t._trackEvent('ShowAddonSurvey');
                 document.cookie = "addonSurveyShown=true;max-age=2628000";
                 var surveyText = "Please help us improve LanguageTool by answering our " +
                     "<a target='_blank' href='https://www.surveymonkey.de/r/LSPH6XY'>1-minute survey - 1 question only!</a>";
                 $('#feedbackErrorMessage').html("<div id='survey'>" + surveyText + "</div>");
             }*/
             /*var marketingText = "NEU: Unter <a href='https://languagetoolplus.com/'>languagetoolplus.com</a> bieten wir eine Premium-Version an, die noch mehr Fehler erkennt.";
             var randThreshold = 0.3;
             var langCode = $('#lang').val();
             var rand;
             if (document.cookie && document.cookie.indexOf("showltplus=") === -1) {
                 rand = Math.random();
                 document.cookie = "showltplus=" + rand.toFixed(2) + ";max-age=2628000";  // one month
                 if (rand < randThreshold && (langCode === 'de-DE' || langCode === 'de-AT' || langCode === 'de-CH')) {
                     t._trackEvent('ShowLTPlusLink');
                     $('#feedbackErrorMessage').html("<div id='survey'>" + marketingText + "</div>");
                 }
             } else if (document.cookie) {
                 rand = parseFloat(document.cookie.match(/showltplus=(\d\.\d\d)/)[1]);
                 if (rand < randThreshold && (langCode === 'de-DE' || langCode === 'de-AT' || langCode === 'de-CH')) {
                     if (!$('form#checkform').hasClass('fullscreen')) {
                         $('#feedbackErrorMessage').html("<div id='survey'>" + marketingText + "</div>");
                     }
                 }
             }*/
         });

         // hack to make both right and left mouse button work on errors in both Firefox and Chrome: 
         /*if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
           editor.onContextMenu.add(plugin._doNotShowMenu, plugin);
         } else {
           editor.onContextMenu.add(plugin._showMenu, plugin);
           editor.onContextMenu.add(plugin._doNotShowMenu, plugin);
         }*/

         /* strip out the markup before the contents is serialized (and do it on a copy of the markup so we don't affect the user experience) */
         editor.onPreProcess.add(function(sender, object) 
         {
            var dom = sender.dom;

            each(dom.select('span', object.node).reverse(), function(n) 
            {
               if (n && (dom.hasClass(n, 'hiddenGrammarError') || dom.hasClass(n, 'hiddenSpellError') || dom.hasClass(n, 'hiddenSuggestion') || dom.hasClass(n, 'mceItemHidden') || (dom.getAttrib(n, 'class') == "" && dom.getAttrib(n, 'style') == "" && dom.getAttrib(n, 'id') == "" && !dom.hasClass(n, 'Apple-style-span') && dom.getAttrib(n, 'mce_name') == ""))) 
               {
                  dom.remove(n, 1);
               }
            });
         });

         /* cleanup the HTML before executing certain commands */
         editor.onBeforeExecCommand.add(function(editor, command) 
         {
            if (command == 'mceCodeEditor')
            {
               plugin._removeWords();
            }
            else if (command == 'mceFullScreen')
            {
               plugin._done();
            }
         });
      },

      createControl : function(name, controlManager) 
      {
      },

      _trackEvent : function(val1, val2, val3, number)
      {
          if (typeof(_paq) !== 'undefined') {
              // Piwik tracking
              if (number !== undefined) {
                  _paq.push(['trackEvent', val1, val2, val3, number]);
              } else {
                  _paq.push(['trackEvent', val1, val2, val3]);
              }
          }
          this._logEventLocally();
      },
       
      _logEventLocally : function()
      {
          if (localStorage) {
              var actionCount = localStorage.getItem('actionCount');
              if (actionCount == null) {
                  actionCount = 0;
                  try {
                      localStorage.setItem('firstUse', new Date());  // get it back using new Date(Date.parse(localStorage.getItem('firstUse')))
                  } catch (ex) {
                      console.log("Could not store 'firstUse' to localStorage: " + ex);
                  }
              } else {
                  actionCount = parseInt(actionCount);
              }
              actionCount++;
              try {
                  localStorage.setItem('actionCount', actionCount);
              } catch (ex) {
                  console.log("Could not store 'actionCount' to localStorage: " + ex);
              }
          }
      },
       
      _serverLog : function(message)
      {
          /*jQuery.ajax({
              url: 'https://languagetool.org/log.php?text=' + message + " - agent: " + navigator.userAgent,
              type: 'POST'
          });*/
      },
       
      _removeWords : function(w) 
      {
         var ed = this.editor, dom = ed.dom, se = ed.selection, b = se.getBookmark();

         ed.core.removeWords(undefined, w);

         /* force a rebuild of the DOM... even though the right elements are stripped, the DOM is still organized
            as if the span were there and this breaks my code */

         dom.setHTML(dom.getRoot(), dom.getRoot().innerHTML);

         se.moveToBookmark(b);
      },

      _removeWordsByRuleId : function(ruleId, coveredText)
      {
         var ed = this.editor, dom = ed.dom, se = ed.selection, b = se.getBookmark();

         ed.core.removeWordsByRuleId(undefined, ruleId, coveredText);

         /* force a rebuild of the DOM... even though the right elements are stripped, the DOM is still organized
            as if the span were there and this breaks my code */

         dom.setHTML(dom.getRoot(), dom.getRoot().innerHTML);

         se.moveToBookmark(b);
      },

      markMyWords : function()
      {
         var ed  = this.editor;
         var se = ed.selection, b = se.getBookmark();

         ed.core.markMyWords();

         se.moveToBookmark(b);
      },

      _doNotShowMenu : function(ed, e) 
      {
        return tinymce.dom.Event.cancel(e);
      },
       
      _showMenu : function(ed, e) 
      {
        
         if (e.which == 3) {
            // ignore right mouse button
            return;
         }
         var t = this, ed = t.editor, m = t._menu, p1, dom = ed.dom, vp = dom.getViewPort(ed.getWin());
         var plugin = this;

         if (m) {
             m.destroy();
         }

         p1 = DOM.getPos(ed.getContentAreaContainer());
         //p2 = DOM.getPos(ed.getContainer());

         m = ed.controlManager.createDropMenu('spellcheckermenu', 
         {
            offset_x : p1.x,
            offset_y : p1.y,
            'class' : 'mceNoIcons'
         });

         t._menu = m;
         
         $(ed.getBody()).find(".selectedError").removeClass("selectedError");
 
         if (this.menuVisible && IS_TOUCH) {
             tinymce.dom.Event.cancel(e);
         }

         if (this.menuVisible && this.selectedTarget === e.target) {
             // second click: close popup again
             m.hideMenu();
             this.selectedTarget = null;
             this.menuVisible = false;
             return;
         }

         if (ed.core.isMarkedNode(e.target))
         {
            /* remove these other lame-o elements */
            m.removeAll();

            /* find the correct suggestions object */
            var errorDescription = ed.core.findSuggestion(e.target);
            var ruleId = errorDescription["id"];
            var lang = plugin.editor.getParam('languagetool_i18n_current_lang')();
            var isSpellingRule = ruleId.indexOf("MORFOLOGIK_RULE") !== -1 || ruleId.indexOf("SPELLER_RULE") !== -1 ||
                                 ruleId.indexOf("HUNSPELL_NO_SUGGEST_RULE") !== -1 || ruleId.indexOf("HUNSPELL_RULE") !== -1 ||
                                 ruleId.indexOf("FR_SPELLING_RULE") !== -1;
            this._updateSentenceTrackingArea(lang);
             
            var otherReplTitleMenuItem = t._getTranslation('editor_other_replace_by');
            if (errorDescription == undefined)
            {
               m.add({title : plugin.editor.getLang('AtD.menu_title_no_suggestions', 'No suggestions'), 'class' : 'mceMenuItemTitle'}).setDisabled(1);
            }
            else if (errorDescription["suggestions"].length == 0)
            {
               m.add({title : errorDescription["description"], 'class' : 'mceMenuItemTitle'}).setDisabled(1);
            }
            else
            {
               m.add({ title : errorDescription["description"], 'class' : 'mceMenuItemTitle' }).setDisabled(1);

               for (var i = 0; i < errorDescription["suggestions"].length; i++)
               {
                  if (i >= 5) {
                      break;
                  }
                  (function(sugg)
                   {
                      var iTmp = i;
                      m.add({
                         title   : sugg, 
                         onclick : function() 
                         {
                            ed.core.applySuggestion(e.target, sugg);
                            t._maybeSendErrorExample(e, errorDescription, isSpellingRule, userHasPastedText, lang, ruleId, sugg, iTmp, errorDescription["suggestions"]);
                            t._trackEvent('AcceptCorrection', lang, ruleId, iTmp+1);  // numeric value, so increase by one to make sure 0 isn't ignored
                            t._checkDone();
                         }
                      });
                   })(errorDescription["suggestions"][i]);
               }
               otherReplTitleMenuItem = t._getTranslation('editor_other_suggestion');

            }

            m.add({ title : otherReplTitleMenuItem, onclick:
                 function() {
                     var otherReplDialog = t._getTranslation('editor_other_suggestion_dialog', lang, "Replace with:");
                     var res = prompt(otherReplDialog, errorDescription["coveredtext"]);
                     if (res !== null) {
                         var repl = $('<div/>').text(res).html();
                         ed.core.applySuggestion(e.target, repl);
                         t._maybeSendErrorExample(e, errorDescription, isSpellingRule, userHasPastedText, lang, ruleId, repl, 99/*special value*/);
                         t._trackEvent('OtherCorrection', lang, ruleId);
                         t._checkDone();
                     }
                 }
            });

            m.addSeparator();

            var explainText = t._getTranslation('editor_explain');
            var ignoreThisText = t._getTranslation('editor_ignore_once');
            var ruleExamples = t._getTranslation('editor_rule_examples');
            var noRuleExamples = t._getTranslation('editor_rule_no_examples');
            var ruleImplementation = t._getTranslation('editor_rule_implementation');
            var suggestWord = t._getTranslation('editor_suggest_word');
            var suggestWordUrl;
            if (plugin.editor.getParam('languagetool_i18n_suggest_word_url')) {
              suggestWordUrl = plugin.editor.getParam('languagetool_i18n_suggest_word_url')[lang];
            }

            if (errorDescription != undefined && errorDescription["moreinfo"] != null)
            {
               (function(url)
                {
                   m.add({
                     title : explainText,
                     onclick : function() { window.open(url, '_errorExplain'); }
                  });
               })(errorDescription["moreinfo"]);
               m.addSeparator();
            }

            if (!isSpellingRule) {
                m.add({
                    title : ignoreThisText,
                    onclick : function()
                    {
                        //dom.remove(e.target, 1);
                        var surrogate = e.target.getAttribute(plugin.editor.core.surrogateAttribute);
                        var ruleId = plugin.editor.core.getSurrogatePart(surrogate, 'id');
                        ed.core.ignoredRulesIds.push(ruleId);
                        t._removeWordsByRuleId(ruleId);
                        //t._trackEvent('IgnoreRule', lang, errorDescription["id"]);
                        t._trackEvent('IgnoreRule', lang, ruleId);
                        t._checkDone();
                        ed.selection.setContent(ed.selection.getContent()); // remove selection (see https://github.com/languagetool-org/languagetool-website/issues/8)
                        /*var stateObj = {};
                        if (window.location.href.indexOf("ignore=") === -1) {
                            history.replaceState(stateObj, "", "/?ignore=" + ruleId);
                        } else {
                            history.replaceState(stateObj, "", window.location.search + "," + ruleId);
                        }*/
                        var coveredText = plugin.editor.core.getSurrogatePart(surrogate, 'coveredtext');
                        if (document.cookie && document.cookie.indexOf("sentenceTracking=store") !== -1) {
                            console.log("tracking ignore rule with sentence");
                            t._sendIgnoreRule(errorDescription["sentence"], coveredText, lang, ruleId);
                        } else {
                            console.log("tracking ignore rule without sentence");
                            t._sendIgnoreRule("", "", lang, ruleId);
                        }
                    }
                });
                if (userHasPastedText) {
                    m.add({
                        title : t._getTranslation('editor_track_false_alarm_menu'),
                        onclick : function()
                        {
                            var surrogate = e.target.getAttribute(plugin.editor.core.surrogateAttribute);
                            var ruleId = plugin.editor.core.getSurrogatePart(surrogate, 'id');
                            var coveredText = plugin.editor.core.getSurrogatePart(surrogate, 'coveredtext');
                            t._removeWordsByRuleId(ruleId, coveredText);
                            ed.selection.setContent(coveredText); // remove selection
                            t._trackEvent('ReportFalseAlarm', lang, ruleId);
                            var escapedSentence = $("<div>").text(errorDescription["sentence"]).html();
                            vex.dialog.open({
                                unsafeMessage:
                                t._getTranslation('editor_track_false_alarm1') +
                                "<br><br><b>" + escapedSentence + "</b><br><br>" +
                                t._getTranslation('editor_track_false_alarm2'),
                                callback: function (data) {
                                    if (data) {
                                        console.log('Okay to store false alarm');
                                        t._sendFalseAlarm(errorDescription["sentence"], coveredText, lang, ruleId);
                                    } else {
                                        console.log('Not okay to store false alarm');
                                    }
                                }
                            });
                        }
                    });
                }
            } else {
                var ignoreThisKindOfErrorText = t._getTranslation('editor_ignore_all');
                m.add({
                    title : ignoreThisKindOfErrorText,
                    onclick : function()
                    {
                        var surrogate = e.target.getAttribute(plugin.editor.core.surrogateAttribute);
                        var ruleId = plugin.editor.core.getSurrogatePart(surrogate, 'id');
                        var coveredText = plugin.editor.core.getSurrogatePart(surrogate, 'coveredtext');
                        ed.core.ignoredSpellingErrors.push(coveredText);
                        t._removeWordsByRuleId(ruleId, coveredText);
                        var ignoreSuccessMessage = t._getTranslation('editor_ignore_success'); 
                        $('#feedbackErrorMessage').html("<div id='personalDictMessage'>" + ignoreSuccessMessage + "</div>");
                        
                        t._trackEvent('IgnoreSpellingError', lang);
                        t._checkDone();
                    }
                });
            }

             if (suggestWord && suggestWordUrl && isSpellingRule) {
                 var newUrl = suggestWordUrl.replace(/{word}/, encodeURIComponent(errorDescription['coveredtext']));
                 (function(url)
                 {
                     m.add({
                         title : suggestWord,
                         onclick : function() { window.open(newUrl, '_suggestWord'); }
                     });
                 })(errorDescription[suggestWord]);
             }

             var langCode = $('#lang').val();
             var subLangCode = $('#subLang').val();
             if (subLangCode) {
                 langCode = langCode.replace(/-.*/, "") + "-" + subLangCode;
             }
             if (langCode === "auto") {
                 langCode = $('#detectedLanguage').text();
             }
            // NOTE: this link won't work (as of March 2014) for false friend rules:
            var ruleUrl = "http://community.languagetool.org/rule/show/" +
              encodeURI(errorDescription["id"]) + "?";
            if (errorDescription["subid"] && errorDescription["subid"] !== 'null' && errorDescription["subid"] !== "undefined") {
              ruleUrl += "subId=" + encodeURI(errorDescription["subid"]) + "&";
            }
            ruleUrl += "lang=" + encodeURI(langCode);
            var isLTServer = window.location.href.indexOf("languagetool.org") !== -1 || window.location.href.indexOf("languagetool.localhost") !== -1 || window.location.href.indexOf("http://127.0.0.1:8000") !== -1;  // will only work for lt.org
            if (isLTServer && errorDescription["id"].indexOf("MORFOLOGIK_") !== 0 && errorDescription["id"] !== "HUNSPELL_NO_SUGGEST_RULE") {  // no examples available for spell checking rules
                m.addSeparator();
                m.add({
                    title : ruleExamples,
                    onclick : function() {
                        plugin.editor.setProgressState(1);
                        var exampleUrl = "https://api.languagetool.org/v2/rule/examples?lang="
                            + encodeURI(langCode) +"&ruleId=" + encodeURI(errorDescription["id"]);
                        jQuery.getJSON(exampleUrl,
                            function(data) {
                                var ruleHtml = "";
                                var exampleCount = 0;
                                $.each(data['results'], function(key, val) {
                                    if (val.sentence && val.status === 'incorrect' && exampleCount < 5) {
                                        ruleHtml += "<span class='example'>";
                                        ruleHtml += "<img src='/images/cancel.png'>&nbsp;" +
                                            val.sentence.replace(/<marker>(.*?)<\/marker>/, "<span class='error'>$1</span>") + "<br>";
                                        // if there are more corrections we cannot be sure they're all good, so don't show any:
                                        if (val.corrections && val.corrections.length === 1 && val.corrections[0] !== '') {
                                            var escapedCorr = $('<div/>').text(val.corrections[0]).html();
                                            ruleHtml += "<img src='/images/check.png'>&nbsp;";
                                            ruleHtml += val.sentence.replace(/<marker>(.*?)<\/marker>/, escapedCorr) + "<br>";
                                        }
                                        ruleHtml += "</span>";
                                        ruleHtml += "<br>";
                                        exampleCount++;
                                    }
                                });
                                if (exampleCount === 0) {
                                    ruleHtml += "<p>" + noRuleExamples + "</p>";
                                    t._trackEvent('ShowExamples', 'NoExamples', ruleId);
                                }
                                ruleHtml += "<p><a target='_lt_rule_details' href='" + ruleUrl + "'>" + ruleImplementation + "</a></p>";
                                var $dialog = $("#dialog");
                                $dialog.html(ruleHtml);
                                $dialog.dialog("open");
                            }).fail(function(e) {
                                var $dialog = $("#dialog");
                                $dialog.html("Sorry, could not get rules. Server returned error code " + e.status + ".");
                                $dialog.dialog("open");
                                t._trackEvent('ShowExamples', 'ServerError');
                            }).always(function() {
                                plugin.editor.setProgressState(0);
                                t._trackEvent('ShowExamples', 'ShowExampleSentences', ruleId);
                            });
                    }
                });
            }

           /* show the menu please */
           if (!IS_TOUCH) {
               ed.selection.select(e.target);
           }
           if (IS_TOUCH) {
              $(ed.getBody()).blur();
           }
           $(e.target).addClass("selectedError");
           p1 = dom.getPos(e.target);

           var xPos = p1.x;

           // moves popup a bit down to not overlap text:
           //TODO: why is this needed? why does the text (tinyMCE content) have a slightly lower start position in Firefox?
           var posWorkaround = 0;
           if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
             posWorkaround = 10;
           } else {
             posWorkaround = 2;
           }

           m.showMenu(xPos, p1.y + e.target.offsetHeight - vp.y + posWorkaround);
           this.menuVisible =  true;
           this.selectedTarget = e.target;
           var menuDiv = $('#menu_checktext_spellcheckermenu_co');
           if (menuDiv) {
               var menuWidth = menuDiv.width();
               var textBoxWidth = $('#checktextpara').width();  // not sure why we cannot directly use the textarea's width
               menuDiv.css({ left: '0px', 'max-width': "100vw" });
               if (xPos + menuWidth > textBoxWidth) {
                   // menu runs out of screen, move it to the left
                   var diff = xPos + menuWidth - textBoxWidth;
                   menuDiv.css({ left: '-' + Math.min(diff, menuDiv.offset().left) + 'px' });
               }
           }

           return tinymce.dom.Event.cancel(e);
         } 
         else
         {
            m.hideMenu();
            this.menuVisible = false;
            this.selectedTarget = null;
         }
      },

       /* send error example to our database */
       _showContributionDialog : function(sentence, correctedSentence, covered, replacement, errorDescription, lang, ruleId, suggestionPos, isSpellingRule, allSuggestions) {
           // source: https://github.com/HubSpot/vex/blob/master/docs/intro.md
           var escapedSentence = $("<div>").text(errorDescription["sentence"]).html();
           var t = this;
           var trackMessage = this._getTranslation('editor_track_message') + "<br><br>" +
                    this._getTranslation('editor_track_message_sentence') + " ";
           var trackRememberMessage = this._getTranslation('editor_track_remember_message');
           var trackNo = this._getTranslation('editor_track_no');
           var trackYes = this._getTranslation('editor_track_yes');
           vex.dialog.open({
               unsafeMessage: trackMessage +
               "\"" + escapedSentence + "\"",
               input: [
                   '<input id="rememberCheckbox" name="remember" type="checkbox" /> <label for="rememberCheckbox">' + trackRememberMessage + '</label>'
               ].join(''),
               buttons: [
                   $.extend({}, vex.dialog.buttons.YES, { text: trackYes }),
                   $.extend({}, vex.dialog.buttons.NO, { text: trackNo })
               ],
               callback: function (data) {
                   if (data) {
                       console.log('Okay to store sentence. Remember setting?', data.remember);
                       if (data.remember === "on") {
                           t._setSentenceTrackingCookie("store");
                       } else {
                           t._setSentenceTrackingCookie("ask");
                       }
                       t._trackEvent('AllowSentenceStorage', "yes");
                       // now send text like the error collection add-on:
                       t._sendErrorExample(sentence, correctedSentence, covered, replacement, lang, ruleId, suggestionPos, allSuggestions);
                   } else {
                       var remember = $('#rememberCheckbox').is(':checked');
                       console.log("Don't store sentence. Remember setting?", remember);
                       if (remember) {
                           t._setSentenceTrackingCookie("do-not-store");
                       } else {
                           t._setSentenceTrackingCookie("ask");
                       }
                       t._trackEvent('AllowSentenceStorage', "no");
                       // A single word does not contain personal data, so it's okay to send
                       // that word, but without the sentence:
                       if (isSpellingRule) {
                           t._sendErrorExample("", "", covered, replacement, lang, ruleId, suggestionPos, allSuggestions);
                       }
                   }
               }
           });
       },
       
       _getTranslation : function(key) {
           return AllMessages[key] || "ERROR:" + key;
       },
       
       _showGenericContributionDialog : function(lang) {
           var t = this;
           var trackMessage = this._getTranslation('editor_track_message');
           var trackNo = this._getTranslation('editor_track_no');
           var trackYes = this._getTranslation('editor_track_yes_plural');
           var trackAsk = this._getTranslation('editor_track_ask');
           vex.dialog.open({
               unsafeMessage: trackMessage,
               buttons: [
                   $.extend({}, vex.dialog.buttons.YES, { text: trackYes }),
                   $.extend({}, vex.dialog.buttons.NO, { text: trackNo }),
                   $.extend({}, vex.dialog.buttons.YES, {
                           type: 'button',
                           text: trackAsk,
                           className: 'vex-dialog-button-secondary',
                           click: function() {
                               this.value = "ask";
                               this.close();
                           } 
                       })
               ],
               callback: function (data) {
                   if (data) {
                       if (data === "ask") {
                           t._setSentenceTrackingCookie("ask");
                       } else {
                           t._setSentenceTrackingCookie("store");
                       }
                   } else {
                       t._setSentenceTrackingCookie("do-not-store");
                   }
                   t._updateSentenceTrackingArea(lang);
               }
           });
       },

       _updateSentenceTrackingArea : function(lang) {
           var t = this;
           var changeSettingText = this._getTranslation('editor_tracking_change');
           if (userHasPastedText && document.cookie && document.cookie.indexOf("sentenceTracking=store") !== -1) {
               var contributingText = this._getTranslation('editor_do_track');
               $('#sentenceContributionMessage').html("<div id='sentenceContribution'>" + contributingText +
                   " <a href='#' onclick='return false'>" + changeSettingText + "</a></a></div>");
               $('#sentenceContribution').unbind('click');
               $('#sentenceContribution').bind('click', function() {
                   t._showGenericContributionDialog(lang);
               });
           } else if (userHasPastedText && document.cookie && document.cookie.indexOf("sentenceTracking=do-not-store") !== -1) {
               var notContributingText = this._getTranslation('editor_do_not_track');
               $('#sentenceContributionMessage').html("<div id='sentenceContribution'>" + notContributingText +
                   " <a href='#' onclick='return false'>" + changeSettingText + "</a></a></div>");
               $('#sentenceContribution').unbind('click');
               $('#sentenceContribution').bind('click', function() {
                   t._showGenericContributionDialog(lang);
               });
           } else {
               $('#sentenceContributionMessage').html("");
           }
       },
       
       _setSentenceTrackingCookie : function(val) {
           document.cookie = "sentenceTracking=" + val + ";max-age=604800;path=/";  // 604.800 = 1 week 
           console.log("sentenceTracking=" + val);
       },

       _escapeRegex : function(s) {
           return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
       },

      _maybeSendErrorExample : function(evt, errorDescription, isSpellingRule, userHasPastedText, lang, ruleId, suggestion, suggestionPos, allSuggestions) {
          if ((window.location.pathname === "/" ||
                  window.location.pathname === "/de/" ||
                  window.location.pathname === "/ru/" ||
                  window.location.pathname === "/fr/" ||
                  window.location.pathname === "/pt/" ||
                  window.location.pathname === "/uk/" ||
                  window.location.pathname === "/it/" ||
                  window.location.pathname === "/nl/" ||
                  window.location.pathname === "/pl/" ||
                  window.location.pathname === "/es/"
              ) &&   // vex is only available here now
              userHasPastedText) {  // pasted text: we don't want example text corrections
              var sentence = errorDescription["sentence"];
              var covered = errorDescription["coveredtext"];
              var re = new RegExp(this._escapeRegex(covered), 'g');
              var replCount = (sentence.match(re) || []).length;
              //console.log("replCount", replCount, "in: '", sentence, "' -- for: ", covered);
              if (replCount === 1) {  // otherwise the correction is ambiguous
                  var correctedSentence = sentence.replace(evt.target.innerText, suggestion);
                  if (document.cookie && document.cookie.indexOf("sentenceTracking=store") !== -1) {
                      this._sendErrorExample(sentence, correctedSentence, covered, suggestion, lang, ruleId, suggestionPos, isSpellingRule, allSuggestions);
                  } else if (document.cookie && document.cookie.indexOf("sentenceTracking=do-not-store") !== -1) {
                      if (isSpellingRule) {
                          console.log("no sentence tracking, tracking only typo word");
                          this._sendErrorExample("", "", covered, suggestion, lang, ruleId, suggestionPos, isSpellingRule, allSuggestions);
                      } else {
                          console.log("no sentence tracking");
                      }
                  } else {
                      this._showContributionDialog(sentence, correctedSentence, covered, suggestion, errorDescription, lang, ruleId, suggestionPos, isSpellingRule, allSuggestions);
                  }
                  this._updateSentenceTrackingArea(lang);
              }
          }
      },
       
      /* send error example to our database */
      _sendErrorExample : function(sentence, correctedSentence, covered, replacement, lang, ruleId, suggestionPos, allSuggestions) {
          var req = new XMLHttpRequest();
          req.open('POST', "https://languagetoolplus.com/submitErrorExample", true);
          req.timeout = 60 * 1000; // milliseconds
        //req.open('POST', "http://localhost:8001/submitErrorExample", true);
          req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          req.onload = function() {
              if (req.status !== 200) {
                  console.warn("Error submitting sentence. Code: " + req.status);
              }
          };
          req.onerror = function() {
              console.warn("Error submitting sentence (onerror).");
          };
          req.ontimeout = function() {
              console.warn("Error submitting sentence (ontimeout).");
          };
          console.log("sending sentence + correction, pos: ", sentence, suggestionPos);
          var allSugg = allSuggestions != null ? "&allReplacements=" + encodeURIComponent(allSuggestions.join("|")) : "";
          req.send(
              "sentence=" + encodeURIComponent(sentence) +
              "&correction=" + encodeURIComponent(correctedSentence) +
              "&url=" + encodeURIComponent("https://languagetool.org") +
              "&lang=" + lang +
              "&ruleId=" + encodeURIComponent(ruleId) +
              "&suggestionPos=" + suggestionPos +
              "&covered=" + encodeURIComponent(covered) +
              "&replacement=" + encodeURIComponent(replacement) +
              allSugg +
              "&username=website" +
              "&client=ltorg" + 
              (pasteId != null ? "&textSessionId=" + encodeURIComponent(pasteId) : "")
          );
      },
       
      /* send false alarm to our database */
      _sendFalseAlarm : function(sentence, coveredText, lang, ruleId) {
          var req = new XMLHttpRequest();
          req.open('POST', "https://languagetoolplus.com/submitFalseAlarm", true);
          req.timeout = 60 * 1000; // milliseconds
          //req.open('POST', "http://localhost:8000/submitFalseAlarm", true);
          req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          req.onload = function() {
              if (req.status !== 200) {
                  console.warn("Error submitting false alarm. Code: " + req.status);
              }
          };
          req.onerror = function() {
              console.warn("Error submitting false alarm (onerror).");
          };
          req.ontimeout = function() {
              console.warn("Error submitting false alarm (ontimeout).");
          };
          console.log("sending false alarm: sentence, coveredText: ", sentence, coveredText);
          req.send(
              "sentence=" + encodeURIComponent(sentence) +
              "&coveredText=" + encodeURIComponent(coveredText) +
              "&lang=" + lang +
              "&ruleId=" + encodeURIComponent(ruleId) +
              "&username=website"
          );
      },
       
      /* send ignored rule to our database for tracking */
      _sendIgnoreRule : function(sentence, coveredText, lang, ruleId) {
          var req = new XMLHttpRequest();
          req.open('POST', "https://languagetoolplus.com/submitIgnoreRule", true);
          req.timeout = 60 * 1000; // milliseconds
          //req.open('POST', "http://localhost:8000/submitIgnoreRule", true);
          req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          req.onload = function() {
              if (req.status !== 200) {
                  console.warn("Error submitting ignore rule. Code: " + req.status);
              }
          };
          req.onerror = function() {
              console.warn("Error submitting ignore rule (onerror).");
          };
          req.ontimeout = function() {
              console.warn("Error submitting ignore rule (ontimeout).");
          };
          console.log("sending ignore rule: sentence, coveredText: ", sentence, coveredText);
          req.send(
              "sentence=" + encodeURIComponent(sentence) +
              "&coveredText=" + encodeURIComponent(coveredText) +
              "&lang=" + lang +
              "&ruleId=" + encodeURIComponent(ruleId) +
              "&username=website"
          );
      },
       
      /* loop through editor DOM, call _done if no mce tags exist. */
      _checkDone : function() 
      {
         var t = this, ed = t.editor, dom = ed.dom, o;

         this.menuVisible = false;
         this.selectedTarget = null;
          
         each(dom.select('span'), function(n) 
         {
            if (n && dom.hasClass(n, 'mceItemHidden'))
            {
               o = true;
               return false;
            }
         });

         if (!o)
         {
            t._done();
         }
      },

      /* remove all tags, hide the menu, and fire a dom change event */
      _done : function() 
      {
         var plugin    = this;
         //plugin._removeWords();

         if (plugin._menu)
         {
            plugin._menu.hideMenu();
            this.menuVisible = false;
            this.selectedTarget = null;
         }

         plugin.editor.nodeChanged();
      },

      sendRequest : function(file, data, languageCode, success)
      {
         url = this.editor.getParam("languagetool_rpc_url", "{backend}");
         // url = "http://localhost:8081/v2/check";  // for testing
         //console.log("url", url);
         var plugin = this;

         var wordCountForLog;
         if (data.trim() === "") {
             wordCountForLog = "none";
         } else if (data.trim().split(' ').length === 1) {
             wordCountForLog = "1";
         } else {
             wordCountForLog = "2+";
         }
         this._trackEvent('WordCount', wordCountForLog);

         if (url == '{backend}') 
         {
            this.editor.setProgressState(0);
            document.checkform._action_checkText.disabled = false;
            alert('Please specify: languagetool_rpc_url');
            return;
         }

         var langParam = "";
         if (languageCode === "auto") {
             langParam = "&language=auto";
         } else {
             langParam = "&language=" + encodeURI(languageCode);
         }

         var pasteParam = "";
         if (pasteId != null) {
             pasteParam = "&textSessionId=" + encodeURI(pasteId);
             url += "?instanceId=" + encodeURI(pasteId);
         }

         var altLangParam = "";
         if (navigator.languages && languageCode.indexOf("en") !== 0) {
             if (navigator.languages.indexOf("en-GB") !== -1) {
                 altLangParam += "&altLanguages=en-GB";
             } else if (navigator.languages.indexOf("en-CA") !== -1) {
                 altLangParam += "&altLanguages=en-CA";
             } else if (navigator.languages.indexOf("en-ZA") !== -1) {
                 altLangParam += "&altLanguages=en-ZA";
             } else if (navigator.languages.indexOf("en-NZ") !== -1) {
                 altLangParam += "&altLanguages=en-NZ";
             } else if (navigator.languages.indexOf("en-AU") !== -1) {
                 altLangParam += "&altLanguages=en-AU";
             } else if (navigator.languages.indexOf("en-US") !== -1 || navigator.languages.indexOf("en") !== -1) {
                 altLangParam += "&altLanguages=en-US";
             }
         }
         //console.log("altLangParam:", altLangParam);

         var t = this;
         // There's a bug somewhere in AtDCore.prototype.markMyWords which makes
         // multiple spaces vanish - thus disable that rule to avoid confusion:
         var postData = "disabledRules=WHITESPACE_RULE,FRENCH_WHITESPACE&" +
             "allowIncompleteResults=true&" +
             "enableHiddenRules=true&" +
             "useragent=ltorg&" +
             "text=" + encodeURI(data).replace(/&/g, '%26').replace(/\+/g, '%2B') + langParam + altLangParam + pasteParam;
         jQuery.ajax({
            url:   url,
            type:  "POST",
            data:  postData,
            success: success,
            error: function(jqXHR, textStatus, errorThrown) {
                // try again
                setTimeout(function() {
                    var fallbackUrl = t.editor.getParam("languagetool_rpc_url_fallback", "{backend}");
                    console.log("Error on first try, trying again using " + fallbackUrl);
                    jQuery.ajax({
                        url:   fallbackUrl,
                        type:  "POST",
                        data:  postData,
                        success: success,
                        error: function(jqXHR, textStatus, errorThrown) {
                            plugin.editor.setProgressState(0);
                            document.checkform._action_checkText.disabled = false;
                            var errorText = jqXHR.responseText;
                            if (!errorText) {
                                errorText = "Error: Did not get response from service. Please try again in one minute.";
                            }
                            var errorTextForAnalytics = errorText;
                            if (data.length > maxTextLength) {
                                // Somehow, the error code 413 is lost in Apache, so we show that error here.
                                // This unfortunately means that the limit needs to be configured in the server *and* here.
                                errorText = "Error: your text is too long (" + data.length + " characters). This server accepts up to " + maxTextLength + " characters. Please consider upgrading to <a target='_blank' href='https://languagetoolplus.com/#premium'>our premium service</a> to check longer texts.";
                                errorTextForAnalytics = "Error: your text is too long";
                            }
                            if (errorText.indexOf("Request size limit of") !== -1) {
                                errorTextForAnalytics = "Error: Request size limit per minute exceeded";
                            } else if (errorText.indexOf("Request limit of") !== -1) {
                                errorTextForAnalytics = "Error: Request limit number per minute exceeded";
                            }
                            $('#feedbackErrorMessage').html("<div id='severeError'>" + errorText + "</div>");
                            t._trackEvent('CheckError', 'ErrorWithException', errorTextForAnalytics);
                            t._serverLog(errorText + " (second try)");
                        }
                    });
                }, 50);
            }
         });

         /* this causes an OPTIONS request to be send as a preflight - LT server doesn't support that,
         thus we're using jQuery.ajax() instead
         tinymce.util.XHR.send({
            url          : url,
            content_type : 'text/xml',
            type         : "POST",
            data         : "text=" + encodeURI(data).replace(/&/g, '%26').replace(/\+/g, '%2B')
                           + langParam
                           // there's a bug somewhere in AtDCore.prototype.markMyWords which makes
                           // multiple spaces vanish - thus disable that rule to avoid confusion:
                           + "&disabled=WHITESPACE_RULE",
            async        : true,
            success      : success,
            error        : function( type, req, o )
            {
               plugin.editor.setProgressState(0);
               document.checkform._action_checkText.disabled = false;
               var errorMessage = "<div id='severeError'>Error: Could not send request to\n" + o.url + "\nError: " + type + "\nStatus code: " + req.status + "\nPlease make sure your network connection works.</div>";
               $('#feedbackErrorMessage').html(errorMessage);
            }
         });*/
      }
   });

   // Register plugin
   tinymce.PluginManager.add('AtD', tinymce.plugins.AfterTheDeadlinePlugin);
})();
