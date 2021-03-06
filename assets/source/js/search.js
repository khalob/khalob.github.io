'use strict';

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

var search = {
	init: function () {
		$('body').on('click', '.tag-filter', function () {
			$(this).toggleClass('active');
			filterResults();
		});

		$('.clear-all-filters').on('click', function () {
			$('.tag-filters .tag-filter.active').removeClass('active');
			$('.search-field').val('');
			$('.list-item').show();
		});

		$('.tag-filter-toggle').on('click', function () {
			$('.tag-filters').slideToggle();
			$(this).toggleClass('open');
		});

		$('.search-field').on('input', function () {
			filterResults();
		});

		$('.search-field').on('keydown', function (e) {
			var code = e.keyCode || e.which;
			if (code === 13) {
				$('.search-field').blur();
			}
		});
	},
	filterResults: filterResults,
	generateTagFilterHTML: generateTagFilterHTML
};

module.exports = search;