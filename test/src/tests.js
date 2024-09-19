describe('Bing Ads Event Forwarder', function () {
    var ReportingService = function () {
            var self = this;
            this.id = null;
            this.event = null;

            this.cb = function (forwarder, event) {
                self.id = forwarder.id;
                self.event = event;
            };

            this.reset = function () {
                self.id = null;
                self.event = null;
            };
        },
        MessageType = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            Commerce: 16,
        },
        EventType = {
            Unknown: 0,
            Navigation: 1,
            Location: 2,
            Search: 3,
            Transaction: 4,
            UserContent: 5,
            UserPreference: 6,
            Social: 7,
            Other: 8,
            Media: 9,
            getName: function () {
                return 'This is my name!';
            },
        },
        ProductActionType = {
            Unknown: 0,
            AddToCart: 1,
            RemoveFromCart: 2,
            Checkout: 3,
            CheckoutOption: 4,
            Click: 5,
            ViewDetail: 6,
            Purchase: 7,
            Refund: 8,
            AddToWishlist: 9,
            RemoveFromWishlist: 10,
            getName: function () {
                return 'Action';
            },
        },
        reportService = new ReportingService();

    before(function () {
        mParticle.EventType = EventType;
        mParticle.MessageType = MessageType;
        mParticle.ProductActionType = ProductActionType;
    });

    beforeEach(function () {
        reportService.reset();
        window.uetq = [];
        mParticle.forwarder.init(
            {
                tagId: 'tagId',
            },
            reportService.cb,
            true
        );
    });

    describe('Init the BingAds SDK', function () {
        it('should init', function (done) {
            window.uetq.length.should.equal(0);

            done();
        });
    });

    describe('Track Events', function () {
        it('should log events', function (done) {
            var obj = {
                EventDataType: MessageType.PageEvent,
                EventName: 'Test Page Event',
                CustomFlags: {
                    'Bing.EventValue': 10,
                },
            };

            mParticle.forwarder.process(obj);

            window.uetq[0].should.have.property('ea', 'pageLoad');
            window.uetq[0].should.have.property('el', 'Test Page Event');
            reportService.cb.should.be.instanceof(Object);

            done();
        });

        it('should log commerce events', function (done) {
            var obj = {
                EventDataType: MessageType.Commerce,
                EventName: 'Test Commerce Event',
                ProductAction: {
                    ProductActionType: ProductActionType.Purchase,
                    TotalAmount: 10,
                },
            };

            mParticle.forwarder.process(obj);

            window.uetq[0].should.have.property('ea', 'eCommerce');
            window.uetq[0].should.have.property('gv', 10);
            window.uetq[0].should.have.property('el', 'Test Commerce Event');
            reportService.cb.should.be.instanceof(Object);

            done();
        });

        it('should not log event without an event name', function (done) {
            mParticle.forwarder.process({
                EventDataType: '',
            });

            window.uetq.length.should.equal(0);

            done();
        });

        it('should not log incorrect events', function (done) {
            mParticle.forwarder.process({
                EventDataType: MessageType.Commerce,
            });

            window.uetq.length.should.equal(0);

            done();
        });
    });
});
