function CircularCarousel(options) {
  console.log('.' + options.className)
  var ele = document.querySelector('.carousel'),
    ovalWidth = options.ovalWidth,
    ovalHeight = options.ovalHeight,
    activeItem = options.activeItem,
    offsetX = options.offsetX,
    offsetY = options.offsetY,
    angle = options.angle,
    items = ele ? ele.querySelectorAll('.' + options.className) : null,
    cycleMax = items.length,
    itemHeights = [],
    cycleDuration = options.duration,
    previousActiveElement = activeItem;

  function positionItems(x, y, angle) {
    var i = 0,
      n = 0,
      beta = -angle * (Math.PI / 180),
      sinbeta = Math.sin(beta),
      cosbeta = Math.cos(beta),
      offsetElement = activeItem,
      offsetNextElement = activeItem + 1;

    itemHeights = [];

    items[activeItem].classList.add('active');

    while (n < cycleMax) {
      i += (360 / cycleMax);
      var alpha = i * (Math.PI / 180);

      var sinalpha = Math.sin(alpha);
      var cosalpha = Math.cos(alpha);

      var X = x + (ovalHeight * cosalpha * cosbeta - ovalWidth * sinalpha * sinbeta);
      var Y = y + (ovalHeight * cosalpha * sinbeta + ovalWidth * sinalpha * cosbeta);

      X = Math.floor(X);
      Y = Math.floor(Y);
      offsetElement++;
      if (offsetElement < 0) {
        offsetElement = cycleMax - 1;
      } else if (offsetElement === cycleMax) {
        offsetElement = 0;
      }
      offsetNextElement++;
      if (offsetNextElement < 0) {
        offsetNextElement = cycleMax - 1;
      } else if (offsetNextElement === cycleMax) {
        offsetNextElement = 0;
      }

      items[offsetElement].style.marginTop = X + 'px';
      items[offsetElement].style.marginLeft = Y + 'px';

      var itemMeta = { 'top': (items[offsetNextElement] && items[offsetNextElement].offsetTop) || 0, 'index': offsetNextElement };
      itemHeights.push(itemMeta);

      n++;
    }

    var activeElement = items[activeItem],
      prevActiveElement = items[previousActiveElement];

    ele.dispatchEvent(new Event('itemBeforeActive', { bubbles: true }));
    ele.dispatchEvent(new Event('itemBeforeDeactivate', { bubbles: true }));

    var afterTimeout = setTimeout(function () {
      ele.dispatchEvent(new Event('itemActive', { bubbles: true }));
      ele.dispatchEvent(new Event('itemAfterDeactivate', { bubbles: true }));
    }, cycleDuration);

    layerHack(activeItem);
  }

  function doSteppedCycle(steps, direction, stepDuration) {
    var i = 0;

    if (direction === 1) {
      while (i < steps) {
        var timeout = setTimeout(function () {
          var activeElement = items[activeItem];
          activeElement.classList.remove('active');
          previousActiveElement = activeItem;
          activeItem++;
          validateActiveItem();
          positionItems(offsetX, offsetY, angle, null);
        }, i * stepDuration);

        i++;
      }
    } else {
      i = steps;
      var k = 0;
      while (i > 0) {
        var timeout = setTimeout(function () {
          var activeElement = items[activeItem];
          activeElement.classList.remove('active');
          previousActiveElement = activeItem;
          activeItem--;
          validateActiveItem();
          positionItems(offsetX, offsetY, angle, null);
        }, k * stepDuration);

        k++;
        i--;
      }
    }
  }

  function validateActiveItem() {
    if (activeItem < 0) {
      activeItem = cycleMax - 1;
    } else if (activeItem >= cycleMax) {
      activeItem = 0;
    }
  }

  function layerHack(oldActiveItem) {
    var sortedItems = itemHeights.sort(function (a, b) {
      return a.top - b.top;
    });
    var i = 0;
    while (i < sortedItems.length) {
      var currentIndex = sortedItems[i].index - 1;
      if (currentIndex >= 0 && currentIndex < items.length) {
        items[currentIndex].style.zIndex = sortedItems.length - 1;
      }
      currentIndex = sortedItems[i].index;
      if (currentIndex >= 0 && currentIndex < items.length) {
        items[currentIndex].style.zIndex = sortedItems.length - 1;
      }
      i++;
    }
    var buggedItem = activeItem + 1;
    if (buggedItem < 0) {
      buggedItem = cycleMax - 1;
    } else if (buggedItem >= cycleMax) {
      buggedItem = 0;
    }
    if (buggedItem >= 0 && buggedItem < items.length) {
      items[buggedItem].style.zIndex = cycleMax;
    }
    if (activeItem >= 0 && activeItem < items.length) {
      items[activeItem].style.zIndex = cycleMax + 1;
    }
  }
  

  function findBestRoute(array, start, end) {
    var left = 0, right = 0;

    var index = start;
    while (index !== end) {
      right++;
      index = (index === array.length - 1) ? 0 : index + 1;
    }

    index = start;
    while (index !== end) {
      left++;
      index = (index === 0) ? array.length - 1 : index - 1;
    }

    return (left > right) ? { 'direction': 1, 'steps': right } : { 'direction': 0, 'steps': left };
  }

  positionItems(offsetX, offsetY, angle);
  var transitionsDelay = setTimeout(function () {
    for (var i = 0; i < items.length; i++) {
      items[i].classList.add('transition');
      items[i].style.transitionDuration = (cycleDuration / 1000) + 's';
    }
  }, 10);

  return {
    cycleActive: function (direction) {
      var activeElement = items[activeItem];
      activeElement.classList.remove('active');
      previousActiveElement = activeItem;
      activeItem = ((direction === 'previous') ? activeItem - 1 : activeItem + 1);
      validateActiveItem();
      positionItems(offsetX, offsetY, angle, null);
    },
    cycleActiveTo: function (index) {
      var activeElement = items[activeItem];
      activeElement.classList.remove('active');
      var difference = Math.abs(index - activeItem);
      if (difference >= 2) {
        var direction = 1;
        var route = findBestRoute(items, activeItem, index);
        doSteppedCycle(route.steps, route.direction, cycleDuration - 100);
      } else {
        previousActiveElement = activeItem;
        activeItem = index;
        validateActiveItem();
        positionItems(offsetX, offsetY, angle, null);
      }
    },
    on: function (e, fn) {
      ele.addEventListener(e, fn);
    }
  };
}
