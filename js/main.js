(function ($) {
  "use strict";

  var portfolioKeyword = "";
  var porftolioSingleActive = false;
  var porftolioSingleJustClosed = false;
  var soundEffects = false;
  var overlay_1, overlay_2, one_page_content, tick;
  var first_load = true;
  var userClickedAutoplayDialog = false;
  var homeLoaded = false;
  var autoplay = false; // Disable autoplay by default

  $(function () {
    one_page_content = $(".one-page-content");
    overlay_1 = $(".overlay-1");
    overlay_2 = $(".overlay-2");

    soundEffects = $("html").hasClass("sound-effects");

    if (soundEffects) {
      tick = document.createElement("audio");
      tick.setAttribute("src", $("html").data("audio-tick"));
    }

    if ($(".header-wrap > img").length) {
      $(".header").css(
        "background-image",
        "url(" + $(".header-wrap > img").attr("src") + ")"
      );
    }

    if ($("html").hasClass("one-page-layout")) {
      $(".home-menu a").each(function (index, element) {
        var menu_link = $(this);
        var file_url = menu_link.attr("href");
        var slug = menu_link.data("slug");

        menu_link.attr("href", "#/" + slug);
        menu_link.data("file-url", file_url);
      });

      $(".close-page").on("click", function (event) {
        $.address.path("");
        history.pushState("", document.title, window.location.pathname);

        if (soundEffects) {
          tick.play();
        }

        return false;
      });

      portfolioKeyword = $("#portfolio-link").data("slug");

      $.address.change(function () {
        var path = $.address.path();
        path = path.slice(1, path.length);

        if (path === "" && first_load) {
          first_load = false;
          return;
        }
        first_load = false;
        setActivePage();

        var detailUrl = giveDetailUrl();
        if (detailUrl !== -1) {
          showProjectDetails(detailUrl);
        } else {
          if ($.address.path().indexOf("/" + portfolioKeyword) !== -1) {
            if (porftolioSingleActive) {
              hideProjectDetails(true, false);
              porftolioSingleJustClosed = false;

              if ($(".one-page-content .content-wrap").is(":empty")) {
                setActivePage();
              }
            }
          }
        }
      });
    }

    $(".search-toggle").on("click", function () {
      $("html").toggleClass("is-search-toggled-on");
      $(".header-search input").trigger("focus");
    });

    if ($("#back-to-top").length) {
      var scrollTrigger = $(window).height() - 400,
        backToTop = function () {
          var scrollTop = $(window).scrollTop();
          if (scrollTop > scrollTrigger) {
            $("#back-to-top").addClass("show");
          } else {
            $("#back-to-top").removeClass("show");
          }
        };
      backToTop();
      $(window).on("scroll", function () {
        backToTop();
      });
      $("#back-to-top").on("click", function (e) {
        e.preventDefault();
        $("html,body").stop().animate(
          {
            scrollTop: 0,
          },
          700,
          "easeInOutExpo"
        );
      });
    }

    $("html").removeClass("no-js");

    $("html").addClass("ready");

    if ($("html").data("click-ripple-animation") === "yes") {
      $("html").append('<i class="ripple"></i>');
      $("html").on("mousedown", function (e) {
        $("i.ripple")
          .addClass("active")
          .css("left", e.pageX)
          .css("top", e.pageY);
      });

      $("i.ripple").on(
        "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
        function () {
          return $("i.ripple").removeClass("active");
        }
      );
    }

    sticky_sidebar();

    fixMarquee();

    $(window).resize(function () {
      fixMarquee();
      sticky_sidebar_update();
    });

    $("body").on("click", ".portfolio-items .media-cell-desc h3", function () {
      $(this).parent().siblings(".media-box").find("a").eq(0).trigger("click");
    });

    function iOSversion() {
      if (/iP(hone|od|ad)/.test(navigator.platform)) {
        var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
        return [
          parseInt(v[1], 10),
          parseInt(v[2], 10),
          parseInt(v[3] || 0, 10),
        ];
      }
    }

    var ver = iOSversion();
    if (ver !== undefined) {
      if (ver[0] >= 12) {
        $("html").addClass("ios12");
      } else {
        $("html").addClass("not-ios12");
      }
    }

    setup();

    // Removed autoplay confirmation dialog
  });

  $(window).on("load", function () {
    $("html").addClass("loaded");
    autoplay = $("#play-music").hasClass("autoplay") ? true : false;
    homeLoaded = true;
    if (autoplay) {
      if (userClickedAutoplayDialog) {
        initializeHome();
      }
    } else {
      initializeHome();
    }

    sticky_sidebar_update();
    fixMarquee();
  });

  function initializeHome() {
    if ($("html").hasClass("one-page-layout")) {
      $("html").addClass("home-loaded");
      homeAnimation();
      homeMusic();
    }
  }

  function setup() {
    coolLinks();

    setupMasonry();

    setupLightbox();

    fillBars();

    setupAjax();

    setupForms();

    setupContactForm();

    tabs();

    toggles();

    fluidMedia();
  }

  var stickySidebar;
  function sticky_sidebar() {
    if ($("#secondary").length) {
      jQuery.support.touch = "ontouchend" in document;
      if (
        window.matchMedia("(min-width: 992px)").matches &&
        !jQuery.support.touch &&
        $("#primary").height() > $("#secondary").height()
      ) {
        stickySidebar = new StickySidebar("#secondary", {
          topSpacing: 40,
          bottomSpacing: 0,
          resizeSensor: true,
          containerSelector: ".site-middle > div",
          innerWrapperSelector: ".sidebar-wrap",
        });
      }
    }
  }

  function sticky_sidebar_update() {
    if ($("#secondary").length) {
      jQuery.support.touch = "ontouchend" in document;
      if (
        stickySidebar &&
        window.matchMedia("(min-width: 992px)").matches &&
        !jQuery.support.touch &&
        $("#primary").height() > $("#secondary").height()
      ) {
        stickySidebar.updateSticky();
      }

      if (window.matchMedia("(max-width: 991px)").matches) {
        if (stickySidebar) {
          stickySidebar.destroy();
        }
      }
    }
  }

  function coolLinks() {
    $(
      ".bg-music-confirm a, .entry-title a, .entry-content > p:not(.more) > a:not(.button):not(.social-link), .nav-single a, .latest-posts a, .cat-links a, .media-cell-desc a, .comment-reply-link, .comment-meta .fn a, #filters a, .post-edit-link, .logged-in-as a, .widget_recent_entries a, .tptn_after_thumb .tptn_link, .widget_categories a, .widget_archive a, .widget_pages a, .widget_meta a, .widget_recent_comments a, .widget_rss a, .widget_nav_menu a, .wp-caption-text a"
    ).addClass("cool-link");
  }

  function fixMarquee() {
    $(".home-marquee, .home-job-title").width(
      $(".home-logo-center").outerWidth() +
        $(".home-text-container").outerWidth()
    );
  }

  function homeAnimation() {
    const $bg = $(".home-bg");
    const $heading = $(".home-heading");
    const $logoInverted = $(".home-bg-logo");
    const $logoLeft = $(".home-logo-left");
    const $logoLeftInner = $logoLeft.find("span");
    const $logoRight = $(".home-logo-right");
    const $logoRightInner = $logoRight.find("span");
    const $textContainer = $(".home-text-container");
    const $text = $(".home-text");
    const $marquee = $(".home-marquee, .home-job-title");
    const $social = $(".home-social");
    const $footer = $(".home-footer");

    const plTl = new TimelineMax({
      onComplete: function () {
        $("body").addClass("is-animation-ended");
      },
    });

    plTl
      .add("start")
      .fromTo(
        $bg,
        0.4,
        { autoAlpha: 0 },
        { autoAlpha: 1, ease: Power3.easeOut },
        "start"
      )
      .fromTo(
        $bg,
        1.8,
        { scale: 2, x: "-70%" },
        { scale: 1, x: "0%", ease: Power3.easeOut },
        "start"
      )
      .to($heading, 0.6, { y: 0, ease: Power3.easeOut }, "-=0.4", "start")

      .add("shiftRight", "+=0.4")
      .to($logoInverted, 0.8, { x: "50%", ease: Power3.easeOut }, "shiftRight")
      .to($bg, 1, { x: "-=7%", ease: Power3.easeOut }, "shiftRight")
      .to($heading, 0.8, { x: "+=35%", ease: Power3.easeOut }, "shiftRight")
      .to(
        $logoRightInner,
        0.8,
        { x: "-100%", ease: Power3.easeOut },
        "shiftRight"
      )
      .to(
        $logoLeftInner,
        0.8,
        { x: "100%", ease: Power3.easeOut },
        "shiftRight"
      )
      .to(
        [$logoRight, $logoLeft],
        0.8,
        { width: 0, padding: 0, ease: Power3.easeOut },
        "shiftRight"
      )
      .to(
        $footer,
        1,
        { autoAlpha: 1, x: 0, ease: Power3.easeOut },
        "shiftRight"
      )

      .add("shiftLeft")
      .to($heading, 0.8, { x: "-=50%", ease: Power3.easeOut }, "shiftLeft")
      .to($textContainer, 0.8, { scaleX: 1, ease: Power3.easeOut }, "shiftLeft")
      .to($text, 1, { autoAlpha: 1, x: 0, ease: Power3.easeOut }, "shiftLeft")
      .to($marquee, 1, { autoAlpha: 1, ease: Power0.easeNone }, "shiftLeft")
      .to($social, 1, { autoAlpha: 1, ease: Power0.easeNone }, "shiftLeft")
      .to($bg, 8, { x: "-=5%", ease: Power0.easeNone }, "shiftLeft")
      .to(
        $logoInverted,
        6,
        { x: "-=2.5%", ease: Power0.easeNone },
        "shiftLeft"
      );

    $(".full-screen-wrap").on("click", function () {
      $(this).toggleClass("active");
      toggleFullScreen();
    });

    function toggleFullScreen() {
      if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement
      ) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
  }

  var music,
    isPlaying,
    isUserTurnedOffMusic,
    isLigtboxTurnedOffMusic,
    autoplayAllowed;
  function homeMusic() {
    music = document.getElementById("bg-music");

    if (music !== null) {
      var button = document.getElementById("toggle");
      function togglePlay() {
        if (isPlaying) {
          music.pause();
          isUserTurnedOffMusic = true;
        } else {
          music.volume = 0.5;
          music.play();
          isUserTurnedOffMusic = false;
        }
      }
      music.onplaying = function () {
        isPlaying = true;
        button.innerHTML = button.getAttribute("data-on-text");
        document.getElementById("music-animation").classList.add("on");
      };
      music.onpause = function () {
        isPlaying = false;
        button.innerHTML = button.getAttribute("data-off-text");
        document.getElementById("music-animation").classList.remove("on");
      };

      var music_toggle = $("#play-music");
      music_toggle.on("click", function () {
        togglePlay();
      });

      if (music_toggle.hasClass("autoplay") && isUserTurnedOffMusic !== true) {
        music_toggle.click();
      } else {
        isUserTurnedOffMusic = true;
      }

      function addOnBlurListener(onBlurCallback, onFocusCallback) {
        var hidden, visibilityState, visibilityChange;
        if (typeof document.hidden !== "undefined") {
          hidden = "hidden";
          visibilityChange = "visibilitychange";
          visibilityState = "visibilityState";
        } else if (typeof document.mozHidden !== "undefined") {
          hidden = "mozHidden";
          visibilityChange = "mozvisibilitychange";
          visibilityState = "mozVisibilityState";
        } else if (typeof document.msHidden !== "undefined") {
          hidden = "msHidden";
          visibilityChange = "msvisibilitychange";
          visibilityState = "msVisibilityState";
        } else if (typeof document.webkitHidden !== "undefined") {
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
          visibilityState = "webkitVisibilityState";
        }

        if (
          typeof document.addEventListener === "undefined" ||
          typeof hidden === "undefined"
        ) {
        } else {
          document.addEventListener(
            visibilityChange,
            function () {
              switch (document[visibilityState]) {
                case "visible":
                  if (onFocusCallback) onFocusCallback();
                  break;
                case "hidden":
                  if (onBlurCallback) onBlurCallback();
                  break;
              }
            },
            false
          );
        }
      }

      function muteAudio() {
        music.pause();
      }

      function unMuteAudio() {
        if (!isUserTurnedOffMusic && !isLigtboxTurnedOffMusic) {
          music.play();
        }
      }

      addOnBlurListener(muteAudio, unMuteAudio);
    }
  }

  function setupAjax() {
    $(
      ".one-page-layout .media-box .ajax, .one-page-layout .portfolio-nav .ajax a"
    ).on("click", function (event) {
      event.preventDefault();

      var url = $(this).attr("href");
      var baseUrl = $.address.baseURL();
      var detailUrl = giveDetailUrl();

      if (url.indexOf(baseUrl) !== -1) {
        var total = url.length;
        detailUrl = url.slice(baseUrl.length + 1, total);
        $.address.path("/" + detailUrl);
      } else {
        detailUrl = url;
        $.address.path(portfolioKeyword + "/" + detailUrl);
      }
    });
  }

  function setupMasonry() {
    var masonry = $(".masonry, .gallery, .wp-block-gallery:not(.is-cropped)");
    if (masonry.length) {
      masonry.each(function (index, el) {
        refreshMasonry();
        $(el).imagesLoaded(function () {
          $(el).isotope({
            layoutMode: $(el).data("layout") ? $(el).data("layout") : "masonry",
          });

          refreshMasonry();
        });

        if (!$(el).data("isotope")) {
          var filters = $(el).siblings(".filters");
          if (filters.length) {
            filters.find("a").on("click", function () {
              var selector = $(this).attr("data-filter");
              $(el).isotope({ filter: selector });
              $(this)
                .parent()
                .addClass("current")
                .siblings()
                .removeClass("current");
              return false;
            });
          }
        }
      });
      $(window).on("resize debouncedresize", function () {
        setTimeout(function () {
          refreshMasonry();
        }, 100);
      });
    }
  }

  function refreshMasonry() {
    var masonry = $(".masonry");
    if (masonry.length) {
      masonry.each(function (index, el) {
        if ($(el).data("isotope")) {
          var itemW = $(el).data("item-width");
          var containerW = $(el).width();
          var items = $(el).children(".hentry");
          var columns = Math.round(containerW / itemW);
          columns = $(window).width() <= 700 ? 2 : columns;

          items.each(function (index, element) {
            var multiplier = $(this).hasClass("x2") && columns > 1 ? 2 : 1;
            var itemRealWidth =
              ((Math.floor(containerW / columns) * 100) / containerW) *
              multiplier;
            $(this).css("width", itemRealWidth + "%");
          });

          var columnWidth = Math.floor(containerW / columns);

          $(el).isotope("option", { masonry: { columnWidth: columnWidth } });
          $(el).isotope("layout");
        }
      });
    }
  }

  function setupLightbox() {
    if ($(".lightbox, .gallery, .wp-block-gallery").length) {
      $(".media-box, .gallery, .wp-block-gallery").each(function (
        index,
        element
      ) {
        var $media_box = $(this);
        $media_box.magnificPopup({
          delegate:
            '.lightbox, figure a[href$=".jpg"], figure a[href$=".jpeg"], figure a[href$=".png"], figure a[href$=".gif"], .gallery-item a[href$=".jpg"], .gallery-item a[href$=".jpeg"], .gallery-item a[href$=".png"], .gallery-item a[href$=".gif"]',
          type: "image",
          image: {
            markup:
              '<div class="mfp-figure">' +
              '<div class="mfp-close"></div>' +
              '<div class="mfp-img"></div>' +
              "</div>" +
              '<div class="mfp-bottom-bar">' +
              '<div class="mfp-title"></div>' +
              '<div class="mfp-counter"></div>' +
              "</div>",

            cursor: "mfp-zoom-out-cur",
            verticalFit: true,
            tError: '<a href="%url%">The image</a> could not be loaded.',
          },
          gallery: {
            enabled: true,
            tCounter: '<span class="mfp-counter">%curr% / %total%</span>',
          },
          iframe: {
            markup:
              '<div class="mfp-iframe-scaler">' +
              '<div class="mfp-close"></div>' +
              '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
              '<div class="mfp-title">Some caption</div>' +
              "</div>",
          },
          mainClass: "mfp-zoom-in",
          tLoading: "",
          removalDelay: 300,
          callbacks: {
            markupParse: function (template, values, item) {
              var title = "";
              if (item.el.parents(".gallery-item").length) {
                title = item.el
                  .parents(".gallery-item")
                  .find(".gallery-caption")
                  .text();
              } else if (item.el.parents(".blocks-gallery-item").length) {
                title = item.el
                  .parents(".blocks-gallery-item")
                  .find("figcaption")
                  .text();
              } else {
                title =
                  item.el.data("title") == undefined
                    ? ""
                    : item.el.data("title");
              }

              values.title = title;
            },
            imageLoadComplete: function () {
              var self = this;
              setTimeout(function () {
                self.wrap.addClass("mfp-image-loaded");
              }, 16);
            },
            beforeClose: function () {
              if (
                this.content.find('iframe[src*="soundcloud.com"]').length ||
                this.content.find('iframe[src*="vimeo.com"]').length ||
                this.content.find('iframe[src*="youtube.com"]').length
              ) {
                if (!isUserTurnedOffMusic) {
                  if (music) {
                    music.play();
                    isLigtboxTurnedOffMusic = false;
                  }
                }
              }
            },
            close: function () {
              this.wrap.removeClass("mfp-image-loaded");
            },
            beforeAppend: function () {
              var self = this;

              if (
                this.content.find('iframe[src*="soundcloud.com"]').length ||
                this.content.find('iframe[src*="vimeo.com"]').length ||
                this.content.find('iframe[src*="youtube.com"]').length
              ) {
                self.wrap.addClass("is-soundcloud");
                if (music) {
                  isLigtboxTurnedOffMusic = true;
                  music.pause();
                }
              }

              if (this.content.find('iframe[src*="soundcloud.com"]').length) {
                self.wrap.addClass("is-soundcloud");
              } else {
                self.wrap.removeClass("is-soundcloud");
              }

              this.content.find("iframe").on("load", function () {
                setTimeout(function () {
                  self.wrap.addClass("mfp-image-loaded");
                }, 16);
              });
            },
          },
          closeBtnInside: false,
          closeOnContentClick: true,
          midClick: true,
        });
      });
    }
  }

  function fillBars() {
    var bar = $(".bar");
    if (bar.length) {
      $(".bar").each(function () {
        var bar = $(this);
        var percent = bar.attr("data-percent");
        bar
          .find(".progress")
          .css("width", percent + "%")
          .html("<span>" + percent + "</span>");
      });
    }
  }

  function tabs() {
    var tabs = $(".tabs");
    if (tabs.length) {
      $(".tabs").each(function () {
        if (!$(this).find(".tab-titles li a.active").length) {
          $(this).find(".tab-titles li:first-child a").addClass("active");
          $(this).find(".tab-content > div:first-child").show();
        } else {
          $(this)
            .find(".tab-content > div")
            .eq($(this).find(".tab-titles li a.active").parent().index())
            .show();
        }
      });

      $(".tabs .tab-titles li a").on("click", function () {
        if ($(this).hasClass("active")) {
          return;
        }
        $(this).parent().siblings().find("a").removeClass("active");
        $(this).addClass("active");
        $(this)
          .parents(".tabs")
          .find(".tab-content > div")
          .hide()
          .eq($(this).parent().index())
          .show();
        return false;
      });
    }
  }

  function toggles() {
    if ($(".toggle").length) {
      var toggleSpeed = 300;
      $(".toggle h4.active + .toggle-content").show();

      $(".toggle h4").on("click", function () {
        if ($(this).hasClass("active")) {
          $(this).removeClass("active");
          $(this).next(".toggle-content").stop(true, true).slideUp(toggleSpeed);
        } else {
          $(this).addClass("active");
          $(this)
            .next(".toggle-content")
            .stop(true, true)
            .slideDown(toggleSpeed);

          if ($(this).parents(".toggle-group").hasClass("accordion")) {
            $(this).parent().siblings().find("h4").removeClass("active");
            $(this)
              .parent()
              .siblings()
              .find(".toggle-content")
              .stop(true, true)
              .slideUp(toggleSpeed);
          }
        }
        return false;
      });
    }
  }

  function fluidMedia() {
    if ($("iframe,video").length) {
      $("html").fitVids();
    }
  }

  function setupForms() {
    if ($("#commentform").length) {
      $("#commentform").addClass("validate-form");
      $("#commentform")
        .find("input,textarea")
        .each(function (index, element) {
          if ($(this).attr("aria-required") == "true") {
            $(this).addClass("required");
          }
          if ($(this).attr("name") == "email") {
            $(this).addClass("email");
          }
        });
    }

    var mailchimpForm = $(".mc4wp-form");
    if (mailchimpForm.length) {
      mailchimpForm.addClass("validate-form");
    }

    if ($(".validate-form").length) {
      $(".validate-form").each(function () {
        $(this).validate();
      });
    }
  }

  function setupContactForm() {
    var contactForm = $("#contact-form");
    if (contactForm.length) {
      var $alert = $(".site-alert");
      var $submit = contactForm.find(".submit");

      contactForm.on("submit", function () {
        if (contactForm.valid()) {
          NProgress.start();
          $submit.addClass("active loading");
          var formValues = contactForm.serialize();

          $.post(contactForm.attr("action"), formValues, function (data) {
            if (data == "success") {
              contactForm.clearForm();
            } else {
              $alert.addClass("error");
            }
            NProgress.done();
            $alert.show();
            setTimeout(function () {
              $alert.hide();
            }, 6000);
          });
        }
        return false;
      });

      $.fn.clearForm = function () {
        return this.each(function () {
          var type = this.type,
            tag = this.tagName.toLowerCase();
          if (tag == "form") return $(":input", this).clearForm();
          if (type == "text" || type == "password" || tag == "textarea")
            this.value = "";
          else if (type == "checkbox" || type == "radio") this.checked = false;
          else if (tag == "select") this.selectedIndex = -1;
        });
      };
    }
  }

  var pActive;

  function showProjectDetails(url) {
    porftolioSingleJustClosed = true;
    porftolioSingleActive = true;

    showLoader();

    var p = $(".p-overlay:not(.active)").first();
    pActive = $(".p-overlay.active");

    p.empty().load(url + " .portfolio-single", function () {
      NProgress.set(0.5);

      p.prepend(p.find(".portfolio-nav").clone());

      p.imagesLoaded(function () {
        hideLoader();

        if (pActive.length) {
          hideProjectDetails();
        }

        $("html").addClass("p-overlay-on");

        setup();

        $("html").addClass("p-animating");

        if (soundEffects) {
          tick.play();
        }

        p.removeClass("animate-in animate-out")
          .addClass("animate-in")
          .show()
          .scrollTop(0);
        p.addClass("active");

        p.one(
          "webkitAnimationEnd oanimationend msAnimationEnd animationend",
          function (e) {
            $("html").removeClass("p-animating");
          }
        );
      });
    });
  }

  function hideProjectDetails(forever, safeClose) {
    porftolioSingleJustClosed = true;

    if (soundEffects) {
      tick.play();
    }

    $("html").addClass("p-animating");

    if (forever) {
      pActive = $(".p-overlay.active");

      $("html").removeClass("p-overlay-on");

      if (!safeClose) {
        $.address.path(portfolioKeyword);
      }
    }

    pActive
      .removeClass("active animate-in animate-out")
      .addClass("animate-out")
      .show();

    pActive.one(
      "webkitAnimationEnd oanimationend msAnimationEnd animationend",
      function (e) {
        $("html").removeClass("p-animating");
        pActive.hide().removeClass("animate-out").empty();
      }
    );

    setTimeout(function () {
      pActive.hide().removeClass("animate-out").empty();
    }, 550);
  }

  function giveDetailUrl() {
    var address = $.address.value();
    var detailUrl;

    if (
      address.indexOf("/" + portfolioKeyword + "/") != -1 &&
      address.length > portfolioKeyword.length + 2
    ) {
      var total = address.length;
      detailUrl = address.slice(portfolioKeyword.length + 2, total);
    } else {
      detailUrl = -1;
    }
    return detailUrl;
  }

  function showLoader() {
    NProgress.start();
  }
  function hideLoader() {
    NProgress.done();
  }

  function setActivePage() {
    var path = $.address.path();
    path = path.slice(1, path.length);

    if (path === "") {
      closePage();
    } else {
      if (porftolioSingleJustClosed) {
        porftolioSingleJustClosed = false;
      } else {
        if (giveDetailUrl() === -1) {
          var new_url = $("a[data-slug=" + path + "]").data("file-url");
          showPage(new_url);
        }
      }
    }
  }

  function showPage(url) {
    overlay_1.css("transition-delay", ".0s").css("transform", "translateY(0%)");
    overlay_2.css("transition-delay", ".2s").css("transform", "translateY(0%)");

    var transitionEnded = false;
    overlay_2.one(
      "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
      function () {
        transitionEnded = true;
      }
    );

    if (soundEffects) {
      tick.play();
    }

    $("html").addClass("is-ajax-page-active");

    jQuery.get(url, function (data) {
      one_page_content.children(".content-wrap").empty();

      one_page_content
        .children(".content-wrap")
        .append($(data).filter("#elementor-frontend-inline-css"))
        .append($(data).filter("link[id^='elementor-post-']"))
        .append($(data).filter("link[id='elementor-frontend-css']"));

      one_page_content
        .children(".content-wrap")
        .append($(data).find(".page-single > .hentry"));

      one_page_content.imagesLoaded(function () {
        $("html").addClass("is-ajax-page-loaded");

        if (transitionEnded) {
          showLoadedPage();
        } else {
          overlay_2.one(
            "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
            function () {
              showLoadedPage();
            }
          );
        }
      });
    });
  }

  function showLoadedPage() {
    console.log("overlay_2.one transitionend");
    one_page_content.addClass("is-visible");
    overlay_2
      .css("transition-delay", ".0s")
      .css("transform", "translateY(100%)");
    overlay_1
      .css("transition-delay", ".2s")
      .css("transform", "translateY(100%)");

    var t = setTimeout(function () {
      $("html").addClass("is-ajax-page-visible");
      clearTimeout(t);
    }, 100);

    setup();
  }

  function closePage() {
    $("html")
      .removeClass("is-ajax-page-active")
      .removeClass("is-ajax-page-loaded")
      .removeClass("is-ajax-page-visible");

    overlay_1.css("transition-delay", ".0s").css("transform", "translateY(0%)");
    overlay_2.css("transition-delay", ".2s").css("transform", "translateY(0%)");

    setTimeout(function () {
      one_page_content
        .removeClass("is-visible")
        .children(".content-wrap")
        .empty();

      overlay_2
        .css("transition-delay", ".0s")
        .css("transform", "translateY(-100%)");
      overlay_1
        .css("transition-delay", ".2s")
        .css("transform", "translateY(-100%)");
    }, 400);
  }
})(jQuery);
