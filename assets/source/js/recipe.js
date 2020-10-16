'use strict';

var login = require('./login');
var search = require('./search');

login.init();
search.init();

function prepareRecipeModal(recipe, recipeName) {
	var $modalTitle = $('#recipe-modal .modal-title');
	var $modalBody = $('#recipe-modal .modal-body');
	var HTML = '',
		ingredientsHTML = '',
		stepsHTML = '';
	var step, stepImage, ingedient;

	for (var ingredientName in recipe.ingredients) {
		ingedient = recipe.ingredients[ingredientName];
		ingredientsHTML += `<li class="${ingedient.isBasic ? 'ingredient' : 'basic-ingredient'}" data-value="${ingredientName}" data-quantity="${ingedient.quantity}">
								${ingedient.quantity + ' ' + ingredientName}
							</li>`;
	}

	for (var stepIndex in recipe.steps) {
		step = recipe.steps[stepIndex];
		stepImage = step.image ? `<img class="step-image" src="${step.image}"/>` : `<div class="empty-step-image">${parseInt(stepIndex) + 1}</div>`;
		stepsHTML += `<div class="step-block">
					${stepImage}
					<h3>${parseInt(stepIndex) + 1}. ${step.title}</h3>
					<p>${step.text}</p>
				</div>`;
	}

	HTML = `<div class="recipe-wrapper">
				<div class="ingredients-block">
					<h3>Ingredients</h3>
					<ul>
						${ingredientsHTML}
					</ul>
				</div>
				<div class="step-blocks">
					${stepsHTML}
				</div>
			</div>`;

	$modalBody.html(HTML);
	$modalTitle.text(recipeName);
}

function generateListHTML(list, tags) {
	if (list) {
		$('.list-wrapper').empty();
		var HTML = '';
		var $itemName = '';
		var tagsHTML = '';
		for (var itemName in list) {
			$itemName = '<span class="item-name">' + itemName + '</span>';
			tagsHTML = '';

			for (var tagName in tags) {
				var taggedItem = tags[tagName];
				if (taggedItem[itemName]) {
					tagsHTML += `<span class="list-item-tag" data-value="${tagName}">${tagName}</span>`;
				}
			}

			HTML += `<div class="list-item" data-name="${itemName}" data-value='${JSON.stringify(list[itemName])}'>
								<div class="item-details">
									${$itemName}
								</div>
								<div class="list-item-tags">
									${tagsHTML}
								</div>
							</div>`;
		}

		$('.list-wrapper').html(HTML);
		search.filterResults();
	}
}

$('body').on('user-sign-in', function () {
	firebase.database().ref('/recipeTags').on('value', function (snapshot) {
		var tags = snapshot.val();
		search.generateTagFilterHTML(tags);

		firebase.database().ref('/recipes').on('value', function (snapshot) {
			var recipes = snapshot.val();
			generateListHTML(recipes, tags);
		});

	});
});

// Trigger recipe modal
$('body').on('click', '.list-item', function (e) {
	var recipeName = $(this).data('name');
	var recipeData = JSON.parse($(this).data('value'));
	prepareRecipeModal(recipeData, recipeName);
	$('#recipe-modal').modal('show');
});
