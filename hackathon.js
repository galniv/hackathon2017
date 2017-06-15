window.Stepper = function() {
  var steps = [];
  var state = {
    currentStep: 0,
    executing: false,
    waiting: false
  };



  var addStep = function(title, stepFunction) {
    state.sidebar.addItem(title);
    steps.push({ title: title, stepFunction: stepFunction });
  };

  var nextStep = function() {
    if (state.executing) {
      state.waiting = true;
      return
    }

    if (state.currentStep < steps.length) {
      state.executing = true;
      steps[state.currentStep].stepFunction(function(success){
        state.sidebar.markItem(steps[state.currentStep].title, success);
        state.executing = false;
        state.currentStep += 1;
        if (state.waiting) {
          nextStep();
        }
      });
    }
  };

  var setSidebar = function(sidebar) {
    state.sidebar = sidebar;
  }

  return {
    addStep: addStep,
    step: nextStep,
    setSidebar: setSidebar
  }
}

var stepper = Stepper();

window.setAll = function(elementArray, properties, animate, animationDuration) {
  if (animate) {
    for (element of elementArray) {
      element.animate(properties, animationDuration);
    }
  }
  else {
    for (element of elementArray) {
      element.attr(properties);
    }
  }
}

window.onload = function() {
  // Load assets
  var paper = Snap("#svg");
  var shadowFilter = Snap('#drop-shadow');
  var raisedShadowFilter = Snap('#drop-shadow-raise');
  var checkIcon = Snap('#check-icon');
  var closeIcon = Snap('#close-icon');
  var securityGateLeft = paper.image('security-gate-left.png', 630, 60, 100, 100);
  var securityGateRight = paper.image('security-gate-right.png', 279, 60, 100, 100);
  var securityGate = [ securityGateLeft, securityGateRight ];

  // BL box & gears
  var blBox = [];
  var blStartX = 140, blStartY = 400;
  blBox.push(paper.rect(blStartX, blStartY, 200, 100).attr({ opacity: 1, fill: '#a26102' }));
  blBox.push(paper.rect(blStartX, blStartY + 100, 200, 60).attr({ opacity: 1, fill: '#d78001' }).transform('m1,0,0.364,1,0,0t-182'));
  blBox.push(paper.rect(blStartX, blStartY, 200, 60).attr({ opacity: 1, fill: '#fb8c00' }).transform('m1,0,0.364,1,0,0t-145'));

  var gear = Snap('#gear').transform('t' + (blStartX + 73) + ',' + (blStartY + 98) + 's2').attr({ fill: '#01579b' });
  var gear2 = gear.clone().transform('t' + (blStartX + 100) + ',' + (blStartY + 65) + 's1.7r18').attr({ fill: '#5d4037' });
  var gear3 = gear.clone().transform('t' + (blStartX + 133) + ',' + (blStartY + 77) + 's2.2r30').attr({ fill: '#004d40' });
  paper.append(gear);
  paper.append(gear2);
  paper.append(gear3);
  blBox.push(gear);
  blBox.push(gear2);
  blBox.push(gear3);
  var matrix = new Snap.Matrix();
  var gearBBox = gear.getBBox()
  function animateGears() {
    gear.rotate(1);
    gear2.rotate(-1);
    gear3.rotate(1);
    setTimeout(animateGears, 20)
  };
  animateGears();

  var frontWall = paper.rect(blStartX + 22, blStartY + 60, 200, 100).attr({ opacity: 1, fill: '#ff9800' });
  blBox.push(frontWall);

  var mask = paper.group().append(paper.rect(blStartX + 22, blStartY + 60, 200, 100).attr({ opacity: 1, fill: 'white' }));
  mask.append(paper.circle(blStartX + 120, blStartY + 110, 50).attr({ opacity: 0.5, fill: 'black' }));
  frontWall.attr({ mask: mask })

  // setAll(blBox, { opacity: 0 });
  blGroup = paper.group();
  for (var i=0; i < blBox.length; i++) {
    blGroup.add(blBox[i]);
  }
  blGroup.transform('t500,-370');
  blFrontGroup = paper.group(gear, gear2, gear3, frontWall);
  blFrontGroup.transform('t500,-370')

  // Add sidebar
  var sidebarGroup;
  var Sidebar = function() {
    sidebarGroup = paper.group().attr({ filter: shadowFilter });
    sidebarGroup.add(paper.rect(700, 25, 250, 600).attr({ fill: '#ffc107' }));

    var items = {};
    var itemCount = 0;
    var itemHeight = 30;
    var itemGap = 10;
    var textPadding = 10;

    return {
      addItem: function(title) {
        items[title] = paper.group().attr({ filter: shadowFilter });
        items[title].add(paper.rect(715, 40 + (itemCount * (itemHeight + itemGap)), 220, itemHeight).attr({ fill: '#ffb74d' }));
        items[title].add(paper.text(745, 50 + (itemCount * (itemHeight + itemGap)) + textPadding, title));
        sidebarGroup.add(items[title]);
        itemCount += 1;
      },
      markItem: function(title, success) {
        setTimeout(function() {
          var itemBoundingBox = items[title].getBBox();
          items[title].add(Snap(success ? checkIcon.clone() : closeIcon.clone()).attr({ x: 718, y: itemBoundingBox.y2 - itemBoundingBox.height + 3 }));
          items[title][0].animate({ fill: '#ffd180' }, 200, mina.easeout, function() {
            items[title][0].animate({ fill: '#ffb74d' }, 200, mina.easeout);
          });
        }, 100);
      }
    }
  }
  stepper.setSidebar(Sidebar());

  // Request
  requestGroup = paper.group().attr({ filter: shadowFilter });
  var requestRect = paper.rect(200, -100, 150, 50).attr({ fill: '#2196f3' });
  requestGroup.add(requestRect);
  blFrontGroup.before(requestRect);

  // Security gate
  var securityGateLights = paper.group();
  var lightLeft = paper.group().append(Snap('#security-gate-light'));
  lightLeft.transform('t202,-180s0.1');
  var lightRight = lightLeft.clone().transform('t-75,-180s-.1,.1');
  securityGateLights.add(lightLeft)
  securityGateLights.add(lightRight);
  securityGate.push(lightLeft);
  securityGate.push(lightRight);

  var dots = [];
  for (var i=0; i < 4; i++) {
    dots.push(paper.circle(347 - (i * 10), 77, 2));
    securityGate.push(dots[i]);
  }
  securityGateGroup = paper.group();
  securityGateGroup.transform('t350')
  for (var i=0; i < securityGate.length; i++) {
    securityGateGroup.add(securityGate[i]);
  }
  var leftGroup = paper.group(lightLeft, securityGateLeft);
  requestGroup.before(leftGroup);

  var cycleColors = ['#e91e63', '#8bc34a', '#00bcd4', ' #ffeb3b'];
  var dotCycleState = 0;
  animateDots = function() {
    for (var i=0; i < 4; i++) {
      dots[i].attr({ fill: cycleColors[(dotCycleState + i) % 4] });
    }

    dotCycleState = (dotCycleState + 1) % 4;
    setTimeout(animateDots, 500);
  }
  animateDots();

  securityGateLights.blink = function() {
    var toggle = false;

    blinkFunction = function() {
      if (toggle) {
        lightLeft.attr({ stroke: '#c62828', strokeWidth: 2 });
        lightRight.attr({ strokeWidth: 0 });
      }
      else {
        lightRight.attr({ stroke: '#c62828', strokeWidth: 2 });
        lightLeft.attr({ strokeWidth: 0 });
      }
      toggle = !toggle;
      securityGateLights.blinkTimer = setTimeout(blinkFunction, 1000);
    };

    blinkFunction();
  };

  securityGateLights.stopBlink = function(stopOnRed) {
    clearTimeout(securityGateLights.blinkTimer);
    lightRight.attr({ stroke: (stopOnRed ? '#c62828' : '#00c853'), strokeWidth: 2});
    lightLeft.attr({ stroke: (stopOnRed ? '#c62828' : '#00c853'), strokeWidth: 2});
  }

  // Conveyor belt
  var conveyorBelt = [];
  var line = paper.line(0, 152, 610, 152).attr({ stroke: '#f1582c', strokeWidth: 2, strokeDasharray: '10 10 10', strokeDashoffset: 0 });
  conveyorBelt.push(line);
  conveyorBelt.push(paper.line(0, 155, 610, 155).attr({ stroke: '#f1582c', strokeWidth: 5 }));
  var lastOffsetValue = 0;
  animateBelt = function() {
    Snap.animate(lastOffsetValue, lastOffsetValue-50, function(offsetValue){
      line.attr({ 'strokeDashoffset': offsetValue })
      lastOffsetValue = offsetValue % 400;
    }, 1000, mina.linear, animateBelt);
  };
  securityGateGroup.after(conveyorBelt[1]);
  blFrontGroup.before(conveyorBelt[0]);
  blFrontGroup.before(conveyorBelt[1]);

  stepper.loadSteps = function() {
    var textarea = document.getElementById('steps');
    var steps = textarea.value;

    try {
      steps = JSON.parse(steps);
    } catch (e) {}

    stepper.addStep('New Request', function(done) {
      requestRect.animate({ transform: 't0,200' }, 1000, mina.bounce, function() {
        done(true);
      });
    });

    steps.forEach(function(step) {
      if (step.key === 'request_id') {
        stepper.addStep(step.title, function(done) {
          document.getElementById('step-metadata').innerHTML = 'Request id: ' + step.id;

          var requestId = {}
          requestId.rect = paper.rect(25, 100, 25, 50).attr({ fill: '#ff5252', filter: shadowFilter });
          requestId.idText = paper.text(30, 130, 'Id');
          requestId.group = paper.group(requestId.rect, requestId.idText).attr({ opacity: 0 });
          requestId.group.animate({ opacity: 1 }, 750, mina.easeinout, function() {
            requestId.group.animate({ transform: 't150' }, 400, mina.easein, function() {
              requestId.rect.attr({ filter: '' });
              requestGroup.add(requestId.group);
              requestId.rect.animate({ fill: '#42a5f5' }, 250, function() {
                done(true);
              });
            });
          });
        });
      } else if (step.key === 'authentication') {
        stepper.addStep(step.title, function(done) {
          if (step.error) {
            document.getElementById('step-metadata').innerHTML = 'Authentication error: ' + step.error.kcs.debug;
          } else {
            document.getElementById('step-metadata').innerHTML = 'Authentication succeded';
          }
          securityGateLights.blink();
          animateBelt();
          securityGateGroup.animate({ transform: 't-400' }, 10000, mina.linear)
          leftGroup.animate({ transform: 't-750' }, 10000, mina.linear)
          setTimeout(function() {
            securityGateLights.stopBlink(step.error ? true : false);
            done(step.error ? false : true);
          }, 6000);
        });
      }
    });
  };

  // // Parse request body
  // stepper.addStep('Parse request body', function(done) {
  //   var jsonText = paper.text(257, 130, '{ ... }');
  //   requestGroup.add(jsonText);
  //   var textCover = paper.rect(200, 115, 150, 30).attr({ fill: '#2196f3' });
  //   var scanLine = paper.line(380, 80, 380, 170).attr({ stroke: '#000000', strokeWidth: 3, opacity: 0 });
  //   scanLine.animate({ opacity: 1 }, 750, mina.easeinout, function() {
  //     scanLine.animate({ x1: 200, x2: 200 }, 2000, mina.easeinout, function() {
  //       textCover.animate({ transform: textCover.transform().localMatrix.scale(0, 1, 350, 115) }, 1800, mina.easeinout);
  //       scanLine.animate({ x1: 380, x2: 380 }, 2000, mina.easeinout, function() {
  //         scanLine.animate({ opacity: 0 }, 250, mina.easeinout, function() {
  //           done(true);
  //         });
  //       });
  //     });
  //   });
  // });

  // // Pre-hook BL
  // stepper.addStep('Business Logic pre-hook', function(done) {
  //   blGroup.animate({ transform: 't-400,-370' }, 10000, mina.linear);
  //   blFrontGroup.animate({ transform: 't-400,-370' }, 10000, mina.linear);

  //   setTimeout(function() {
  //     done(true);
  //   }, 1000);
  // });



  var canvasEdge = paper.rect(600, 25, 350, 600).attr({ fill: 'white' });
  canvasEdge.after(sidebarGroup);
};