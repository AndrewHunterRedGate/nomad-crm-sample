var SearchPageViewModel = function (server, user, password) {
    var that = this;
    that.customerArray = ko.observableArray([]);
    
    /*
    ajax(server + '/api/customers/', user, password, 'GET', {
        context: this,
        success: function (data) {
            var mappedData = $.map(data, function(item) {
                var fromJs = ko.mapping.fromJS(item);
                fromJs['Notes'] = ko.observable(item['Notes']);
                fromJs['DisplayName'] = ko.computed(function() {
                    return fromJs.FirstName() + ' ' + fromJs.SecondName();
                });
                return fromJs;
            });
            
            this.customerArray(mappedData);
        }
    });
    */
    
    // TODO: send modified records first to stop them getting stomped on
    sync.updateRecords(server, user, password, function() {
        syncDataModel.retrieveAll(function(data) {
            var mappedData = $.map(data, function (item) {
                var fromJs = ko.mapping.fromJS(item);
                fromJs['Notes'] = ko.observable(item['Notes']);
                fromJs['DisplayName'] = ko.computed(function () {
                    return fromJs.FirstName() + ' ' + fromJs.SecondName();
                });
                return fromJs;
            });

            that.customerArray(mappedData);
        });
    });

    that.SelectedCustomer = ko.observable();
    
    that.viewCustomer = function (customer) {
        PageStateManager.changePage('viewPage.html', new ViewPageViewModel(server, user, password, customer));
    };
};
