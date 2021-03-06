const SortItOut = angular.module("SortItOutScore", [])

SortItOut.controller("SortItOutScoreCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
	$scope.loaded = false
	$scope.zoomIndex = {
		folder: -1,
		item: -1
	}

	$scope.start = (instance, qset, scoreTable, isPreview, version = '1') => {
		$scope.update(qset, scoreTable)
	}

	$scope.update = (qset, scoreTable) => {
		$scope.folders = buildFolders(qset, scoreTable)
		$scope.showCorrectAnswers = false
		$scope.$apply()

		Materia.ScoreCore.setHeight( getHeight() )
		$timeout( () => {
			Materia.ScoreCore.setHeight( getHeight() )
			// need to properly adjust image heights after the scroll height is set
			$scope.loaded = true
		}, 5000)
	}

	const getHeight = () => {
		return Math.ceil(parseFloat(
			window.getComputedStyle(document.querySelector("html")).height
		))
	}

	const buildFolders = (qset, scoreTable) => {
		let folders = []
		let folderNames = {}
		let imageMap = {}
		$scope.questionValue = 100 / qset.items.length

		for (let item of qset.items) {
			const folderName = item.answers[0].text
			if (item.options.image) {
				imageMap[item.questions[0].text] = Materia.ScoreCore.getMediaUrl(
					item.options.image
				)
			}
			if (folderNames[folderName] == undefined) {
				folderNames[folderName] = folders.length
				folders.push({
					name: folderName,
					items: [],
					extraItems: [],  // items that were placed here that don't belong
					correctCount: 0, // number of items correctly placed
					pointsOff: 0
				})
			}
		}

		for (let entry of scoreTable) {
			const [text, userFolderName, correctFolderName]  = entry.data

			const correctFolderIndex = folderNames[correctFolderName]
			const userFolderIndex = folderNames[userFolderName]
			const correct = userFolderName == correctFolderName

			folders[userFolderIndex].placeCount++

			const item = {
				text,
				correct,
				userFolderName,
				image: imageMap[text] || false
			}

			// put the correct ones at the beginning of the array
			if (correct) {
				folders[correctFolderIndex].items.unshift(item)
				folders[userFolderIndex].correctCount++
			}
			else {
				folders[correctFolderIndex].items.push(item)
				folders[userFolderIndex].extraItems.push({
					text,
					image: imageMap[text] || false,
					correctFolderName
				})
				folders[correctFolderIndex].pointsOff -= $scope.questionValue
			}
		}

		return folders
	}

	$scope.zoomImage = (folder, item) => {
		if ($scope.zoomIndex.folder == folder && $scope.zoomIndex.item == item) {
			$scope.zoomIndex = {
				folder: -1,
				item: -1
			}
		}
		else {
			$scope.zoomIndex = {
				folder,
				item
			}
		}
	}

	Materia.ScoreCore.hideResultsTable()
	Materia.ScoreCore.start($scope)
}])
