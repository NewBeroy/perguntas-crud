var $s, $s1;
var vm;

const url_pesquisar = '<url_pesquisar>';
const url_getById = '<url_getById>';
const url_remover = '<url_remover>';
const url_salvar = '<url_salvar>';


var app = angular.module("app",[]);

//diretiva para resolver o post dos botoes
app.directive('eatClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    }
});



//diretiva para exibir a tela de confirmação. Usada na consulta de questões
app.directive("ngConfirmClick", [
  function() {
   return {
     priority: -1,
      restrict: "A",
      link: function(scope, element, attrs) {
        element.bind("click", function(e) {
          var message;
          message = attrs.ngConfirmClick;
          if (message && !confirm(message)) {
           e.stopImmediatePropagation();
           e.preventDefault();
          }
        });
      }
    };
  }
])


app.controller("ctrl", function ($scope, $http, $timeout) {

		
	$s = $scope;
	
	vm = this;
	//$s.http = $http;
	$s.http = httpMock;

	$s.pesquisa = {};
	$s.formEdicao = {};
		
	$s.aba = 'pesquisa';
	$s1 = $scope;

	function request(func, url, params, onSuccessFunction, onFailFunction) {
		
		if (params instanceof Function) {
			$s.erro = 'params instanceof Function';
			return;
		}
		if (onSuccessFunction && !(onSuccessFunction instanceof Function)){
			$s.erro = '!(onSuccessFunction instanceof Function)';
			return;
		}
		if (onFailFunction && !(onFailFunction instanceof Function)){
			$s.erro = '!(onFailFunction instanceof Function)';
			return;
		}		
		
    	var rp = { headers: {'Content-Type': 'application/json'}};
		if(!params) params = [];
    	if (params.responseType) {
    		rp.responseType = 'arraybuffer';
    	}		
		func(url, params, rp).then(
			function(data){
				if (data.erro) {
					if (onFailFunction) onFailFunction(data);	
				} else {
				if (onSuccessFunction) onSuccessFunction(data);	
				}
			},
			function(data){
				if (onFailFunction) onFailFunction(data);
			},
		);
    }
	var post = function(url, params, onSuccessFunction, onFailFunction) {
		request($s.http.post, url, params, onSuccessFunction, onFailFunction);
	}
	var get = function(url, params, onSuccessFunction, onFailFunction) {
		request($s.http.get, url, params, onSuccessFunction, onFailFunction);
	}

	$s.btnPesquisarClick = function(){
		$s.pesquisaExecutar();
	}

	$s.btnPesquisaLimparClick = function(){
		//limpa o form de pesquisa
		$s.pes = {};

		//limpa a lista de consulta, nesse momento a table fica vazia e é oculta pela diretiva ng-show 
		$s.pesquisa.items = [];	
	}

	$s.btnRowEditClick = function(id) {
		
		//recupera o registro pelo id passado da grid
		get(url_getById, {id:id}, function(data){
			
			//coloco o objeto model
			$s.formEdicao.o = data.o;	
			//set a aba do cadastro
			$s.aba = 'cadastro';

		});		
	}
	$s.btnRowRemoveClick = function(id){
		get(url_remover, {id:id}, function(data){
			
			if (data.erro) {
				$s.erro = data.erro;
			} else {
				var index = -1;	
				for (var i = 0; i < $s.pesquisa.items.length; i++) {
					if ( $s.pesquisa.items[i].id === id ) {
						index = i;
						break;				
					}
				}
				if( index !== -1 ) {
					$s.pesquisa.items.splice( index, 1 );	
				}
			}

		});

	}

	$s.opcaoUpdate = function(index) {
        for (var i=0;i< $s.formEdicao.o.opcoes.length; i++) {
            if (index != i) {
                $s.formEdicao.o.opcoes[i].correta = 'false';
            }
        }
	}
	$s.btnVoltaAbaConsulta = function(){
		$s.abaPesquisa();
	}
	
	
	$s.btnSalvar = function(){


		post(url_salvar, {o:$s.formEdicao.o}, function(data){
			
			if (data.erro) {
				$s.erro = data.erro;
			} else {
				//console.log(data.o);
				$s.formEdicao.o = data.o;
			}

		});
	}
	
	$s.abaPesquisa = function(){
		$s.aba = 'pesquisa';
	}

	$s.getById = function(id){
		
		get(url_getById, {id:id}, function(data){
			$s.formEdicao.o = data.o;	
			
			//vm.records = data.o.opcoes;
			console.log($s.pesquisa.items);

		});
	}

	$s.pesquisaExecutar = function(){
		//limpa a lista de consulta, nesse momento a table fica vazia e é oculta pela diretiva ng-show 
		$s.pesquisa.items = [];	
		// caso o campo de pesquisa esteja preenchido, usar texto para pesquisa, caso contrário usar branco
		let text = $s.pes  ? $s.pes.text : '';
		
		get(url_pesquisar, {text:text}, function(data){
			// a lista de consulta recebe o retorno.
			$s.pesquisa.items = data.list;	
			
			console.log($s.pesquisa.items);

		});
	}
	
	$s.opcoesRemover = function(index){
		//$s.formEdicao.o.opcoes.splice(index, 1);]
		if ($s.formEdicao.o.opcoes[index].status == 'deletado' ) {
			$s.formEdicao.o.opcoes[index].status = '';
		} else {
			$s.formEdicao.o.opcoes[index].status = 'deletado';
		}
	}
	$s.opcoesAdicionar = function(){
		$s.formEdicao.o.opcoes.push({id: null, text:'', correta: false});
	}	
	

	$('body').show();


});


//https://hello-angularjs.appspot.com/removetablerow