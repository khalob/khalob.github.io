'use strict';

var login = require('./login');

login.init();

function generateListHTML(list, tags) {
	if (list) {
		$('.list-wrapper').empty();
		var HTML = '';
		var $closeButton = '<button type="button" class="remove-item" data-toggle="modal" data-target="#confirmation-modal">×</button>';
		var $toggleButton = '<label class="toggle-item"></label>';
		var $itemName = '';
		var $quantity = '';
		var tagsHTML = '';
		for (var itemName in list) {
			$itemName = '<span class="item-name">' + itemName + '</span>';
			$quantity = '<span class="quantity">' + list[itemName].quantity + '</span>';
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
								${$closeButton}
							</div>`;
		}

		$('.list-wrapper').html(HTML);
		filterResults();
	}
}

function generateTagFilterHTML(tags) {
	if (tags) {
		$('.tag-filters').empty();
		var HTML = '';
		for (var tagName in tags) {
			HTML += `<span class="tag-filter" data-value="${tagName}">${tagName}</span>`;
		}

		$('.tag-filters').html(HTML);
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
	var isDF = itemName.endsWith(' (DF)');
	var itemName = itemName.replace(' (DF)', '');
	$('#add-item-modal .modal-title').text('Edit ' + itemName);
	$('#add-item-modal button[type="submit"]').text('Apply Edits');
	var $form = $('form#add-item');
	$form.find('#item-name').val(itemName);
	$form.find('#item-name').attr('readonly', 'true');
	$form.find('#brand').val(item.brand ? item.brand : '');
	$form.find('#quantity').val(itemQuantity);

	for (var tagIndex in item.tags) {
		var tagName = item.tags[tagIndex];
		if (tagName && $form.find('.item-tags span[data-value="' + tagName + '"]').length === 0) {
			$form.find('.item-tags').append('<span class="tag" data-value="' + tagName + '">' + tagName + '<span class="tag-remove">×</span></span>');
		}
		$('.appendable-tags .append-tag[data-value="' + tagName + '"]').hide();
	}

	$form.find('#df').val(isDF);
}

function filterResults() {
	var searchValue = $('.search-field').val();
	var $activeTags = $('.tag-filters .tag-filter.active');
	var $searchResults = $('.list-item');

	// Filter the results to the ones containing the search term
	if (searchValue && searchValue !== '') {
		$searchResults = $searchResults.filter(':icontains(' + searchValue + ')');
	}

	// Filter the results to the ones that contain all active tags
	$activeTags.each(function () {
		var tagName = $(this).data('value');
		$searchResults = $searchResults.filter(function () {
			return $(this).find(`.list-item-tag[data-value="${tagName}"]`).length > 0;
		});
	});

	$('.list-item').hide();
	$searchResults.show();
}

function insertNewTag(tagName) {
	var curInput = tagName ? tagName : $('#item-tags-input').val();
	if (curInput && $('.item-tags span[data-value="' + curInput + '"]').length === 0) {
		$('.item-tags').append('<span class="tag" data-value="' + curInput + '">' + curInput + '<span class="tag-remove">×</span></span>');
		$('#item-tags-input').val('').focus();
	}
}

$('body').on('user-sign-in', function () {
	$('body').addClass('logged-in');

	firebase.database().ref('/tags').on('value', function (snapshot) {
		var tags = snapshot.val();
		generateTagFilterHTML(tags);
		generateAppendableTagHTML(tags);

		firebase.database().ref('/lists').on('value', function (snapshot) {
			var lists = snapshot.val();
			generateListHTML(lists['grocery'], tags);
		});

	});
});

$('body').on('click', '#show-add-form', function (e) {
	e.preventDefault();
	$('#add-item-modal').find('.modal-title, button[type="submit"]').text('Add Item');
	$('form#add-item #item-name').removeAttr('readonly');
	$('form#add-item .appendable-tags .append-tag').show();
	$('form#add-item').trigger('reset');
	$('#add-item-modal').modal('show');
});

$('body').on('submit', 'form#add-item', function (e) {
	var itemName = login.parseUserData($(this).find('#item-name').val());
	if ($('#df').is(':checked')) {
		itemName += ' (DF)';
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
		insertNewTag();
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
	firebase.database().ref('/tags').on('value', function (snapshot) {
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
	firebase.database().ref('/lists/grocery/' + itemName).update({
		"/enabled": (!currentStatus).toString()
	});
});

// Trigger edit item modal
$('body').on('click', '.list-item', function (e) {
	if ($(e.target).is('.list-item, .item-details')) {
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

$('.search-field').on('input', function () {
	filterResults();
});

$('.add-tag-btn').on('click', function () {
	insertNewTag();
});

$('body').on('click', '.tag-remove', function () {
	var $parent = $(this).parent();
	var itemName = $parent.data('value');
	$(`.append-tag[data-value="${itemName}"]`).show();
	$(this).parent().remove();
});

$('body').on('click', '.append-tag', function () {
	insertNewTag($(this).data('value'));
	$(this).hide();
});

$('body').on('reset', 'form#add-item', function () {
	$('.item-tags').html('');
});

$('.tag-filter-toggle').on('click', function () {
	$('.tag-filters').slideToggle();
	$(this).toggleClass('open');
});

$('.clear-all-filters').on('click', function () {
	$('.tag-filters .tag-filter.active').removeClass('active');
	$('.search-field').val('');
	$('.list-item').show();
});

$('body').on('click', '.tag-filter', function () {
	$(this).toggleClass('active');
	filterResults();
});

$('body').on('show.bs.modal', '#confirmation-modal', function (e) {
	var $button = $(e.relatedTarget); // Button that triggered the modal
	var itemName = $button.parent().data('name');

	var $modal = $(this);
	$modal.find('.modal-body p').text('Are you sure you want to remove ' + itemName + ' from the list?');
	$modal.find('.btn-primary').data('item-name', itemName);
});
