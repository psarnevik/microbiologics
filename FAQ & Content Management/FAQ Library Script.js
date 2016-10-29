define(
    'FAQ', [
        'jQuery'
    ],
    function($) {
        loadFaqPage = function() {
            //https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=273&deploy=1&compid=915960_SB3&h=b8ea22cb527ea2531680&contentType=1
            var faqSuiteletURL = "/app/site/hosting/scriptlet.nl?script=273&deploy=1&compid=915960_SB3&h=b8ea22cb527ea2531680&contentType=1";

            $.ajax({
                type: "GET",
                url: faqSuiteletURL,
                async: false,
                success: function(response) {
                    jsonData = JSON.parse(response);
                    buildFaq(jsonData.contents);
                },
                error: function(xhr, status, error) {
                    console.log("error on faq::" + error);
                }
            });

            function buildFaq(data) {

                $('.faq-data').empty();
                var sel = $('<select>').addClass('faq-topic-dd').appendTo('.faq-data');
                var qaSection = $('<div>').appendTo('.faq-data');

                var dropDownArray = [];

                sel.append($("<option>").attr('value', "").text("Select a topic to narrow your search"));
                var allTopicText = "All Topics";
                var faqTopic = "<div class='faq-topic'>" + allTopicText + "</div>";
                $('.faq-data').append(faqTopic);

                $(data).each(function() {

                  var topicVal = this.topic.replace(/ /g, "").replace(/'/g, "");

                    if ($.inArray(this.topic, dropDownArray) == -1) {
                        dropDownArray.push(this.topic);
                        sel.append($("<option>").attr('value', topicVal).text(this.topic));
                    }

                    var qaItem = "<div class='faq-qa-section " + topicVal + "'>" +
                        "<p class='base-bold-text'>" + decodeURIComponent(this.title) + "</p>" +
                        "<p>" + decodeURIComponent(this.detail) + "</p>" +
                        "</div>";
                    $('.faq-data').append(qaItem);
                });

                $(".faq-topic-dd").change(function() {
                    $(".faq-qa-section").hide();
                    var showQa = this.value;

                    if (showQa == "") {
                        $(".faq-qa-section").show();
                        $(".faq-topic").text($(".faq-topic-dd option:selected").text());
                    } else {
                        $("." + showQa).show();
                        $(".faq-topic").text(allTopicText);
                    }

                });
            }


        }
    });



    // <div class="top-banner-container">
    //     <div class="top-banner-overlay"></div>
    //     <img src="img/landingpage/secondary-action-bar.jpg" alt="">
    //     <div class="top-banner-section">
    //         <h2 class="top-banner-text">Frequently Asked Questions</h2>
    //         <p class="top-banner-detail">Your most common questions in one place.</p>
    //     </div>
    // </div>
