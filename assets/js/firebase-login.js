function showAccount(userData) {
	$('#sign-in').hide();
	$('.account-image').attr('src', userData.photoURL);
	$('.account-name').text(userData.displayName);
	$('.account-email').text(userData.email);
	$('#account-info').show();
}

function parseUserData(userData) {
	var str = userData && userData.toString ? userData.toString() : '';
	var data = str.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
	return data.trim ? data.trim() : data;
}

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

			if (tagsHTML) {
				tagsHTML = '<div class="list-item-tags">' + tagsHTML + '</div>';
			}

			HTML += `<div class="list-item" data-enabled="${list[itemName].enabled}" data-name="${itemName}" >
			 					${$toggleButton}
								<div class="item-details">
									${$itemName}
									${$quantity}
								</div>
								${tagsHTML}
								${$closeButton}
							</div>`;
		}

		$('.list-wrapper').html(HTML);
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

function prepareEditModal(item, itemName, itemQuantity) {
	var isDF = itemName.endsWith(' (DF)');
	var itemName = itemName.replace(' (DF)', '');
	$('#add-item-modal .modal-title').text('Edit ' + itemName);
	var $form = $('form#add-item');
	$form.find('#item-name').val(itemName);
	$form.find('#item-name').attr('readonly', 'true')
	$form.find('#brand').val(item.brand ? item.brand : '');
	$form.find('#quantity').val(itemQuantity);

	for (var tagIndex in item.tags) {
		var tagName = item.tags[tagIndex];
		if (tagName && $form.find('.item-tags span[data-value="' + tagName + '"]').length === 0) {
			$form.find('.item-tags').append('<span class="tag" data-value="' + tagName + '">' + tagName + '<span class="tag-remove">×</span></span>');
		}
	}

	$form.find('#df').val(isDF);
}

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		showAccount(user.providerData[0]);
		$('body').trigger('user-sign-in');
	} else {
		// User is signed out.
		$('#account-info').hide();
		$('#sign-in').show();
	}
});

$('body').on('click', '#sign-out', function () {
	firebase.auth().signOut();
});

$('body').on('click', '#sign-in', function () {
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
		alert(errorMessage);
	});
});

$('body').on('user-sign-in', function () {
	$('body').addClass('logged-in');

	firebase.database().ref('/tags').on('value', function(snapshot) {
		var tags = snapshot.val();
		generateTagFilterHTML(tags);

		firebase.database().ref('/lists').on('value', function(snapshot) {
			var lists = snapshot.val();
			generateListHTML(lists['grocery'], tags);
		});

	});
});

$('body').on('click', '#show-add-form', function (e) {
	e.preventDefault();
	$('#add-item-modal .modal-title').text('Add Item');
	$('form#add-item #item-name').removeAttr('readonly');
	$('form#add-item').trigger('reset');
	$('#add-item-modal').modal('show');
});

$('body').on('submit', 'form#add-item', function (e) {
		var itemName = parseUserData($(this).find('#item-name').val());
		if ($('#df').is(':checked')) {
			itemName += ' (DF)';
		}

		var tags = [];
		var tagValue;
		$('.item-tags .tag').each(function () {
				tagValue = '' + $(this).data('value');
		    tags.push(tagValue);

				firebase.database().ref('/tags/' + tagValue).set({
					[itemName]: true
				});
		});

	  firebase.database().ref('/lists/grocery/' + itemName).set({
			quantity: $(this).find('#quantity').val(),
			enabled: "true"
	  });

		firebase.database().ref('/foods/' + itemName).set({
			brand: parseUserData($(this).find('#brand').val()),
			tags: tags
	  });

		$('#add-item-modal').modal('hide');
		e.preventDefault();
});

// Remove item from list
$('body').on('click', '.remove-item-confirm', function (e) {
	e.stopPropagation();
	var itemName = $(this).data('item-name');
	firebase.database().ref('/lists/grocery/' + itemName).set(null);
	firebase.database().ref('/foods/' + itemName).set(null);

	// delete itemName from each attached tag
	firebase.database().ref('/tags').on('value', function(snapshot) {
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
	if ($(e.target).hasClass('list-item')) {
		var itemName = $(this).data('name');
		var itemQuantity = $(this).find('.quantity').text();
		firebase.database().ref('/foods/' + itemName).once('value', function(snapshot) {
			$('form#add-item').trigger('reset');
			var itemData = snapshot.val();
			prepareEditModal(itemData, itemName, itemQuantity);
			$('#add-item-modal').modal('show');
		});
	}
});

$('.search-field').on('input', function () {
	var searchValue = $(this).val();
	if (searchValue && searchValue !== '') {
		var $searchResults = $('.list-item:visible:icontains(' + searchValue + ')');
		$('.list-item').hide();
		$searchResults.show();
	} else {
		$('.list-item').show();
	}
});

$('.add-tag-btn').on('click', function () {
	var curInput = $('#item-tags').val();
	if (curInput && $('.item-tags span[data-value="' + curInput + '"]').length === 0) {
		$('.item-tags').append('<span class="tag" data-value="' + curInput + '">' + curInput + '<span class="tag-remove">×</span></span>');
		$('#item-tags').val('');
	}
});

$('body').on('click', '.tag-remove', function () {
	$(this).parent().remove();
});

$('body').on('reset', 'form#add-item', function () {
	$('.item-tags').html('');
});

$('.tag-filter-toggle').on('click', function () {
	$('.tag-filters').slideToggle();
	$(this).toggleClass('open');
});

$('body').on('click', '.tag-filter', function () {
	$(this).toggleClass('active');
	var tagValue = $(this).data('value');

	if (tagValue && tagValue !== '') {
		//var $searchResults = $('.list-item:visible TODO tags');
		//$('.list-item').hide();
		//$searchResults.show();
	} else {
		$('.list-item').show();
	}
});

$('body').on('show.bs.modal', '#confirmation-modal', function (e) {
  var $button = $(e.relatedTarget); // Button that triggered the modal
	var itemName = $button.parent().data('name');

  var $modal = $(this);
  $modal.find('.modal-body p').text('Are you sure you want to remove ' + itemName + ' from the list?');
	$modal.find('.btn-primary').data('item-name', itemName);
})
