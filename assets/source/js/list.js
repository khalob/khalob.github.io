'use strict';

var login = require('./login');
var search = require('./search');
var _ = require('underscore');

var RESET_QUANTITY = "1";

login.init();
search.init();

function generateListHTML(list, tags) {
	if (list) {
		$('.list-wrapper').empty();
		var HTML = '';
		var $closeButton = '<button type="button" class="remove-item" data-toggle="modal" data-target="#confirmation-modal">×</button>';
		var $toggleButton = '<label class="toggle-item"></label>';
		var $itemName = '';
		var $quantity = '';
		var tagsHTML = '';
		var synonyms = '';
		for (var itemName in list) {
			$itemName = '<span class="item-name">' + itemName + '</span>';
			$quantity = '<span class="quantity">' + list[itemName].quantity + '</span>';
			synonyms = list[itemName].synonyms ? list[itemName].synonyms.replaceAll(', ', ' ') : '';
			tagsHTML = '';

			for (var tagName in tags) {
				var taggedItem = tags[tagName];
				if (taggedItem[itemName]) {
					tagsHTML += `<span class="list-item-tag" data-value="${tagName}">${tagName}</span>`;
				}
			}

			HTML += `<div class="list-item" data-enabled="${list[itemName].enabled}" data-name="${itemName}" >
			 					${$toggleButton}
								<div class="item-details">
									${$itemName}
									${$quantity}
								</div>
								<div class="list-item-tags">
									${tagsHTML}
								</div>
								<div class="list-item-synonyms">
									${synonyms}
								</div>
								${$closeButton}
							</div>`;
		}

		$('.list-wrapper').html(HTML);
		search.filterResults();
	}
}

function generateAppendableTagHTML(tags) {
	if (tags) {
		$('.appendable-tags').empty();
		var HTML = '';
		for (var tagName in tags) {
			HTML += `<span class="append-tag" data-value="${tagName}">${tagName}</span>`;
		}

		$('.appendable-tags').html(HTML);
	}
}

function prepareEditModal(item, itemName, itemQuantity) {
	$('#add-item-modal .modal-title').text('Edit ' + itemName);
	$('#add-item-modal button[type="submit"]').text('Apply Edits');
	var $form = $('form#add-item');
	$form.find('#item-name').val(itemName);
	$form.find('#item-name').attr('data-editname', itemName);
	$form.find('#brand').val(item.brand ? item.brand : '');
	$form.find('#synonyms').val(item.synonyms ? item.synonyms : '');
	$form.find('#quantity').val(itemQuantity);
	$form.find('.item-tags').attr('data-edittags', item.tags);
	$form.find('#df').parent().hide();

	for (var tagIndex in item.tags) {
		var tagName = item.tags[tagIndex];
		if (tagName && $form.find('.item-tags span[data-value="' + tagName + '"]').length === 0) {
			$form.find('.item-tags').append('<span class="tag" data-value="' + tagName + '">' + tagName + '<span class="tag-remove">×</span></span>');
		}
		$('.appendable-tags .append-tag[data-value="' + tagName + '"]').hide();
	}
}

function insertNewTag(tagName, useFocus) {
	var curInput = $('#item-tags-input').val();
	if (tagName) {
		curInput = tagName;
	} else if (curInput) {
		curInput = curInput.trim();
	}

	if (curInput && $('.item-tags span[data-value="' + curInput + '"]').length === 0) {
		$('.item-tags').append('<span class="tag" data-value="' + curInput + '">' + curInput + '<span class="tag-remove">×</span></span>');
		$('#item-tags-input').val('');
		if (useFocus) {
			$('#item-tags-input').focus();
		}
	}
}

$('body').on('user-sign-in', function () {
	var firstOccurence = true;

	firebase.database().ref('/tags').on('value', function (snapshot) {
		if (!firstOccurence) {
			var tags = snapshot.val();
			search.generateTagFilterHTML(tags);
			generateAppendableTagHTML(tags);

			firebase.database().ref('/lists/grocery').once('value', function (listSnapshot) {
				var groceryList = listSnapshot.val();
				generateListHTML(groceryList, tags);
			});
		}
		firstOccurence = false;
	});

	firebase.database().ref('/lists/grocery').on('value', function (listSnapshot) {
		var groceryList = listSnapshot.val();

		firebase.database().ref('/tags').once('value', function (snapshot) {
			var tags = snapshot.val();
			search.generateTagFilterHTML(tags);
			generateAppendableTagHTML(tags);
			generateListHTML(groceryList, tags);
		});
	});
});

$('body').on('click', '.show-add-form', function (e) {
	e.preventDefault();
	$('#add-item-modal').find('.modal-title, button[type="submit"]').text('Add Item');
	$('form#add-item #item-name').removeAttr('data-editname');
	$('form#add-item .item-tags').removeAttr('data-edittags');
	$('form#add-item .appendable-tags .append-tag').show();
	$('form#add-item #df').parent().show();
	$('form#add-item').trigger('reset');
	// Prefill item name with current search
	$('form#add-item #item-name').val($('.search-field').val());
	$('#add-item-modal').modal('show');
});

$('body').on('submit', 'form#add-item', function (e) {
	var editName = $(this).find('#item-name').attr('data-editname');
	var itemName = login.parseUserData($(this).find('#item-name').val());

	if ($('#df').is(':checked')) {
		itemName += ' (DF)';
	}

	if (editName && editName !== itemName) {
		// Remove old name from databse
		firebase.database().ref('/lists/grocery/' + editName).set(null);
		firebase.database().ref('/foods/' + editName).set(null);

		// Remove old name from tags portion of database
		var prevTagCSV = $('form#add-item .item-tags').attr('data-edittags');
		var prevTags = prevTagCSV ? prevTagCSV.split(',') : [];
		for (var tagIndex in prevTags) {
			var tagName = prevTags[tagIndex];
			firebase.database().ref('/tags/' + tagName + '/' + editName).set(null);
		}
	}

	var tags = [];
	var tagValue;
	$('.item-tags .tag').each(function () {
		tagValue = "" + $(this).data('value');
		tags.push(tagValue);

		firebase.database().ref('/tags/' + tagValue + '/' + itemName).set(true);
	});

	firebase.database().ref('/lists/grocery/' + itemName).set({
		quantity: $(this).find('#quantity').val(),
		synonyms: login.parseSynonyms($(this).find('#synonyms').val()),
		enabled: "true"
	});

	firebase.database().ref('/foods/' + itemName).set({
		brand: login.parseUserData($(this).find('#brand').val()),
		tags: tags
	});

	$('#add-item-modal').modal('hide');
	e.preventDefault();
});

// Don't submit form, if enter key press is coming from tag adding input
$('body').on('keypress', 'form#add-item', function (e) {
	if (e.which == 13 && $(e.target).is('#item-tags-input')) {
		insertNewTag(null, true);
		return false;
	}
});

// Remove item from list
$('body').on('click', '.remove-item-confirm', function (e) {
	e.stopPropagation();
	var itemName = $(this).data('item-name');
	firebase.database().ref('/lists/grocery/' + itemName).set(null);
	firebase.database().ref('/foods/' + itemName).set(null);

	// delete itemName from each attached tag
	firebase.database().ref('/tags').once('value', function (snapshot) {
		var tags = snapshot.val();
		for (var tagName in tags) {
			firebase.database().ref('/tags/' + tagName + '/' + itemName).set(null);
		}
	});

	$('#confirmation-modal').modal('hide');
});

// Update enabled/disabled status
$('body').on('click', '.toggle-item', function (e) {
	e.stopPropagation();
	var $item = $(this).parent();
	var itemName = $item.data('name');
	var currentStatus = $item.data('enabled');
	var itemData = {
		"/enabled": (!currentStatus).toString(),
	};
	if (currentStatus) {
		// Reset quantity, when item is marked completed
		itemData["/quantity"] = RESET_QUANTITY;
	}
	firebase.database().ref('/lists/grocery/' + itemName).update(itemData);
});

// Trigger edit item modal
$('body').on('click', '.list-item', function (e) {
	if ($(e.target).is('.list-item, .item-details, .item-name, .quantity')) {
		var itemName = $(this).data('name');
		var itemQuantity = $(this).find('.quantity').text();
		firebase.database().ref('/foods/' + itemName).once('value', function (snapshot) {
			$('form#add-item').trigger('reset');
			var itemData = snapshot.val();
			prepareEditModal(itemData, itemName, itemQuantity);
			$('#add-item-modal').modal('show');
		});
	}
});

$('.add-tag-btn').on('click', function () {
	insertNewTag(null, true);
});

$('body').on('click', '.tag-remove', function () {
	var $parent = $(this).parent();
	var itemName = $parent.data('value');
	$(`.append-tag[data-value="${itemName}"]`).show();
	$(this).parent().remove();
});

$('body').on('click', '.append-tag', function () {
	insertNewTag($(this).data('value'), false);
	$(this).hide();
});

$('body').on('reset', 'form#add-item', function () {
	$('.item-tags').html('');
});

$('body').on('show.bs.modal', '#confirmation-modal', function (e) {
	var $button = $(e.relatedTarget); // Button that triggered the modal
	var itemName = $button.parent().data('name');

	var $modal = $(this);
	$modal.find('.modal-body p').text('Are you sure you want to remove ' + itemName + ' from the list?');
	$modal.find('.btn-primary').data('item-name', itemName);
});

$('body').on('click', '.scroll-to-top', function (e) {
	e.preventDefault();
	$('html, body').animate({ scrollTop: 0 }, "slow");
});

var toggleScrollToBtnDisplay = _.debounce(function () {
	var MIN_THRESHOLD = 500;
	var scrollToTopIsVisible = $('.scroll-to-top').is(':visible');
	var scrollDepthMet = $(window).scrollTop() > $('.list-wrapper').offset().top && $(window).scrollTop() > MIN_THRESHOLD;
	if (scrollToTopIsVisible && !scrollDepthMet) {
		$('.scroll-to-top').fadeOut('slow');
	} else if (!scrollToTopIsVisible && scrollDepthMet) {
		$('.scroll-to-top').fadeIn('slow');
	}
}, 200);

var toggleScrollToBtnDisplayMobile = _.debounce(function () {
	var scrollToTopIsVisible = $('.scroll-to-top').is(':visible');
	var scrollDepthMet = $(window).width() <= 480 && $('.list-wrapper').offset().top < 0;;
	if (scrollToTopIsVisible && !scrollDepthMet) {
		$('.scroll-to-top').fadeOut('slow');
	} else if (!scrollToTopIsVisible && scrollDepthMet) {
		$('.scroll-to-top').fadeIn('slow');
	}
}, 200);

$(document).ready(function () {
	$(window).on('scroll', toggleScrollToBtnDisplay);
	$('body').on('scroll', toggleScrollToBtnDisplayMobile);
});