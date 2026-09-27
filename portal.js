/* Interactions portail — dropdowns, favoris, transitions */
(function ($) {
  if (!$ || !$.fn) return;

  function closeOtherDropdowns(exceptId) {
    $('[id^="deroulant_"]').each(function () {
      var id = this.id;
      if (exceptId && id === exceptId) return;
      var $root = $(this);
      $root.find(".bouton_deroulant").removeClass("show_bouton_deroulant");
      $root.find(".btn_partage").removeClass("show");
      $root.find(".tousmesoutils_appli").removeClass("is-open");
      $root.removeClass("open");
    });
  }

  $(function () {
    // Dropdown tuiles (CROUS, Prévention, Emploi du temps…)
    $(document).on("click", '[id^="deroulant_"][id$="_b"]', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var btnId = this.id; // deroulant_250_b
      var rootId = btnId.replace(/_b$/, "");
      var $root = $("#" + rootId);
      if (!$root.length) $root = $(this).closest('[id^="deroulant_"]');
      var $panel = $root.find(".bouton_deroulant").first();
      var $share = $panel.find(".btn_partage").first();
      var opening = !$panel.hasClass("show_bouton_deroulant");

      closeOtherDropdowns($root.attr("id"));

      if (opening) {
        $panel.addClass("show_bouton_deroulant").stop(true, true).hide().slideDown(280);
        $share.addClass("show");
        $(this).addClass("is-open");
        $root.addClass("open");
      } else {
        $panel.stop(true, true).slideUp(220, function () {
          $panel.removeClass("show_bouton_deroulant");
        });
        $share.removeClass("show");
        $(this).removeClass("is-open");
        $root.removeClass("open");
      }
      return false;
    });

    // Empêcher le <a href="#"> parent de remonter en haut
    $(document).on("click", 'a.partage[id^="deroulant_"]', function (e) {
      if ($(e.target).closest(".btn_partage a").length) return;
      e.preventDefault();
    });

    // Popup Emploi du temps (favori)
    $(".clickme").off("click.portal").on("click.portal", function (e) {
      e.preventDefault();
      var $pop = $(".popuptext");
      $pop.css("display", "block").stop(true, true).fadeIn(200);
      try {
        $pop.offset({ top: e.pageY + 40, left: e.pageX - 70 });
      } catch (err) {}
    });
    $(document).on("click.portal", ".hideme", function () {
      $(".popuptext").stop(true, true).fadeOut(180);
    });
    $(document).on("click.portal", function (e) {
      if (!$(e.target).closest(".clickme, .popuptext").length) {
        $(".popuptext").fadeOut(150);
      }
    });

    // Organiser ses favoris — feedback visuel
    $("#btndragdrop").on("click.portal", function () {
      var $lock = $("#locker");
      var locked = $lock.hasClass("fa-lock");
      $lock
        .toggleClass("fa-lock", !locked)
        .toggleClass("fa-lock-open", locked);
      $("#outils_picto").toggleClass("organizing", locked);
      $(this).toggleClass("active", locked);
    });

    // Smooth hover class on menu items
    $(".navmenugeneral a, header .navigation ul.niv1 > li > a").on(
      "mouseenter",
      function () {
        $(this).addClass("is-hover");
      }
    ).on("mouseleave", function () {
      $(this).removeClass("is-hover");
    });

    // Overflow labels (comme le site)
    if (typeof isOverflown === "function") {
      document.querySelectorAll(".tousmesoutils_appli").forEach(function (item) {
        if (isOverflown(item)) item.classList.add("enq");
      });
    }
  });
})(window.jQuery);
