;(() => {
  const infoDivClassName = 'img-info-div-debug'

  // Remove info divs
  const removeInfoDivs = () => {
    document.querySelectorAll(`.${infoDivClassName}`).forEach((e) => e.remove())
  }

  // Cleanup function to remove info divs and event listeners
  const cleanup = () => {
    removeInfoDivs()
    window.removeEventListener('resize', debouncedShowImagesSizes)
    window.removeEventListener('scroll', debouncedShowImagesSizes)
    chrome.runtime.onMessage.removeListener(messageListener)
  }

  // Show image sizes
  const showImagesSizes = () => {
    removeInfoDivs()

    const imgs = document.querySelectorAll('img')
    imgs.forEach((img) => {
      const infoDiv = document.createElement('div')
      infoDiv.style.position = 'absolute'
      infoDiv.style.top = '0'
      infoDiv.style.background = 'white'
      infoDiv.style.color = 'black'
      infoDiv.style.textAlign = 'left'
      infoDiv.style.minWidth = '100px'
      infoDiv.style.maxWidth = '97%'
      infoDiv.style.borderTop = '1px solid #ddd'
      infoDiv.style.borderLeft = '1px solid #ddd'
      infoDiv.style.boxShadow = '4px 4px 10px gray'
      infoDiv.style.borderBottomRightRadius = '12px'
      infoDiv.style.zIndex = '9999'
      infoDiv.classList.add(infoDivClassName)

      const renderedWith = img.clientWidth
      const renderedHeight = img.clientHeight
      const loadedWidth = img.naturalWidth
      const loadedHeight = img.naturalHeight

      const infoDivRendered = document.createElement('div')
      infoDivRendered.style.padding = '10px 10px 5px'
      infoDivRendered.innerHTML = `Rendered: ${renderedWith} x ${renderedHeight}`
      infoDiv.appendChild(infoDivRendered)

      const infoDivLoaded = document.createElement('div')
      infoDivLoaded.style.padding = '5px 10px 10px'
      infoDivLoaded.innerHTML = `Loaded: ${loadedWidth} x ${loadedHeight}`
      infoDiv.appendChild(infoDivLoaded)

      const infoDivColor = document.createElement('div')
      infoDivColor.style.textWrap = 'wrap'
      infoDivColor.style.padding = '10px 20px 10px 10px'
      infoDivColor.style.borderBottomRightRadius = '10px'
      infoDivColor.style.minHeight = '1.5em'
      infoDiv.appendChild(infoDivColor)

      const objectFitContain = getComputedStyle(img).objectFit === 'contain'

      const gray = '#dcdcde'
      const green = '#92b93d'
      const yellow = '#ffbb33'
      const red = '#ff6870'

      if (loadedWidth === 0 || loadedHeight === 0) {
        infoDivColor.style.backgroundColor = gray
        infoDivColor.innerHTML =
          'Image loaded later. Resize window to recalculate.'
      } else if (
        objectFitContain &&
        loadedWidth < renderedWith &&
        loadedHeight < renderedHeight
      ) {
        infoDivColor.innerHTML =
          'Loaded image is too small (object-contain; height and width need to be large enough)'
        infoDivColor.style.backgroundColor = red
      } else if (
        !objectFitContain &&
        (loadedWidth < renderedWith || loadedHeight < renderedHeight)
      ) {
        infoDivColor.innerHTML =
          'Loaded image is too small (not object-contain; height or width need to be large enough)'
        infoDivColor.style.backgroundColor = red
      } else if (
        ((loadedWidth >= renderedWith && loadedWidth < renderedWith * 2) ||
          (loadedHeight >= renderedHeight &&
            loadedHeight < renderedHeight * 2)) &&
        loadedWidth * loadedHeight < renderedWith * renderedHeight * 3 // don't load 3 times more pixles than needed
      ) {
        infoDivColor.style.backgroundColor = green
        infoDivColor.innerHTML = 'Loaded image has the right size.'

        if (
          objectFitContain &&
          (loadedWidth < renderedWith || loadedHeight < renderedHeight)
        ) {
          infoDivColor.innerHTML +=
            ' (For object-contain only width OR height need to be large enough)'
        }
      } else {
        infoDivColor.innerHTML = 'Loaded image is too big'
        infoDivColor.style.backgroundColor = yellow

        if (loadedHeight >= renderedHeight * 2) {
          infoDivColor.innerHTML += ' (height is double the size needed)'
        } else if (loadedWidth >= renderedWith * 2) {
          infoDivColor.innerHTML += ' (width is double the size needed)'
        } else if (
          loadedWidth * loadedHeight >=
          renderedWith * renderedHeight * 3
        ) {
          infoDivColor.innerHTML +=
            ' (number of pixels is 3 times more than needed)'
        }
      }

      let parent = img.parentElement
      if (parent?.tagName.toLowerCase() === 'picture') {
        parent.after(infoDiv)
        parent = parent.parentElement
      } else {
        img.after(infoDiv)
      }

      if (parent) {
        const parentPosition =
          getComputedStyle(parent).getPropertyValue('position')
        if (!['relative', 'absolute'].includes(parentPosition)) {
          parent.style.position = 'relative'
        }
      }
    })
  }

  // Debounce function
  const debounce = (callback, wait) => {
    let timeoutId = null
    return (...args) => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        callback(...args)
      }, wait)
    }
  }

  // Debounce showImagesSizes
  const debouncedShowImagesSizes = debounce(showImagesSizes, 100)

  // setup message listener
  const messageListener = (request, sender, sendResponse) => {
    if (request.type === 'TOGGLE_STATE') {
      if (request.enabled) {
        debouncedShowImagesSizes()
        window.addEventListener('resize', debouncedShowImagesSizes)
        window.addEventListener('scroll', debouncedShowImagesSizes)
      } else {
        cleanup()
      }
    }
    sendResponse({ received: true })
    return true
  }

  // Set up the listener immediately
  try {
    chrome.runtime.onMessage.addListener(messageListener)
  } catch (error) {
    console.error('Error registering message listener:', error)
  }

  // Initial state check
  chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATE' }, (response) => {
    if (response) {
      debouncedShowImagesSizes()
      window.addEventListener('resize', debouncedShowImagesSizes)
      window.addEventListener('scroll', debouncedShowImagesSizes)
    }
    // else {
    //   // we don't need to clean up because the old context is still listening to the events
    // }
  })
})()
