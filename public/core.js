var findAlums = angular.module('findAlums', [])

.controller('mainController', ($scope, $http) => {

  let JSONattributes = ['lastName', 'firstName', 'gradYear', 'position', 'company', 'committee', 'boardPosition', 'dukeEmail', 'email', 'linkedin'];
  // this is a $scope object for table header
  $scope.humanAttributes = ['Last Name', 'First Name', 'Graduation Year', 'Current Position', 'Current Company',
                            'Committee(s)', 'Board Positions', 'Duke Email', 'Non-Duke Email', 'LinkedIn'];

  $scope.committees = ['Annual Events', 'Campus Concerts', 'Coffeehouse', 'Downtown Duke', 'Duke Student Broadcasting', 'Freewater Presentations', 'Freewater Productions', 'Innovations', 'Jazz@', 'Joe College Concerts', 'LDOC','Major Attractions','Small Town Records','Speakers & Stage','Special Events','VisArts','WXDU'];

  $scope.positions = ['Committee Chair', 'CFO', 'CMO', 'CTO', 'EVP', 'VPA', 'VPE', 'VPI', 'President'];

  $scope.comm_checked = {};
  for(var i = 0; i < $scope.committees.length; i++){
    $scope.comm_checked[$scope.committees[i]] = false;
  }

  $scope.pos_checked = {};
  for(var i = 0; i < $scope.positions.length; i++){
    $scope.pos_checked[$scope.positions[i]] = false;
  }

  // create attributes array which maps machine name to human name
  $scope.attributes = JSONattributes.map((element, index) => {
    return {
      value: element,
      humanName: $scope.humanAttributes[index]
    }
  });

  $http.get('/alums')
    .then((res) => {
      let rawData = res.data;
      // transform data into objects for sorting
      $scope.data = []; // will be array of person objects
      console.log(rawData);
      rawData.forEach((person) => {
        var personObject = {};
        person.forEach((attribute, index) => {
          let attrName = $scope.attributes[index].value;
          personObject[attrName] = attribute === undefined ? '&nbsp;' : attribute;
        });
        console.log(personObject)
        $scope.data.push(personObject);
      });
    }).catch((err) => {
      console.log(err);
    });

    $scope.within = function(){
        var yr = $scope.yrLimit;
        return function(item){
            if(yr === undefined){
                return true;
            }
            else if (yr.min == null && yr.max == null){
              return true;
            }
            else if (yr.min == null){
                return item['gradYear'] <= yr.max;
            } else if (yr.max == null){
                return item['gradYear'] >= yr.min;
            }
          return item['gradYear'] >= yr.min && item['gradYear'] <= yr.max;
        }
    }

    $scope.isPosChecked = function(){
        return function(item){
          var allFalse = true;

          for(var i = 0; i < $scope.positions.length; i++){
            if($scope.pos_checked[$scope.positions[i]]){
              allFalse = false;
            }
          }

          if(allFalse){
            return true;
          }

          var posStr = item["boardPosition"];
          var ret = false;
          if(posStr != ""){
            var poses = posStr.split(", ");
            poses.forEach((pos) =>{
              if ($scope.pos_checked[pos] && $scope.pos_checked[pos]!=undefined){
                ret = true;
              }
            });
          }
          return ret;
        }
    }

    $scope.isCommChecked = function(){
        return function(item){
          var allFalse = true;

          for(var i = 0; i < $scope.committees.length; i++){
            if($scope.comm_checked[$scope.committees[i]]){
              allFalse = false;
            }
          }

          if(allFalse){
            return true;
          }

          var commStr = item["committee"];
          var ret = false;
          if(commStr != ""){
            var comms = commStr.split(", ");
            comms.forEach((comm) =>{

              if ($scope.comm_checked[comm] && $scope.comm_checked[comm]!=undefined){
                ret = true;
              }
            });
          }
          return ret;
        }
    }
});
