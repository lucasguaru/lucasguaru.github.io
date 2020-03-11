var app = angular.module('searchApp', []);
app.controller('HomeController', ($scope) => {
    $scope.result = [{
        titulo: 'Título 1',
        descricao: 'Reunimos as melhores práticas para criar o seu conteúdo com qualidade e rapidez, e tudo isso em um só lugar. Você ganha melhor visibilidade de seu site ou blog, geração automática de conteúdo rápido e de qualidade',
        url: 'https://www.google.com/search?q=input+arredondado+css'
    }, {
        titulo: 'Título 2',
        descricao: 'Target an element that has all of multiple classes. Shown below with two classes, but not limited to two',
        url: 'https://www.google.com/search?q=input+arredondado+css'
    }];


});