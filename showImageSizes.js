if (!('showImagesSizes' in document)) {
  const infoDivClassName = 'img-info-div-debug'
  document.infoDivClassName = infoDivClassName

  const showImagesSizes = () => {
    document.querySelectorAll(`.${infoDivClassName}`).forEach((element) => {
      element.remove()
    })

    const imgs = document.querySelectorAll('img')
    imgs.forEach((img) => {
      const infoDiv = document.createElement('div')
      infoDiv.style.position = 'absolute'
      infoDiv.style.top = '0'
      infoDiv.style.background = 'white'
      infoDiv.style.color = 'black'
      infoDiv.style.border = '1px solid black'
      infoDiv.style.textAlign = 'left'
      infoDiv.style.maxWidth = '100%'
      infoDiv.classList.add(infoDivClassName)

      const renderedWith = img.clientWidth
      const renderedHeight = img.clientHeight
      const loadedWidth = img.naturalWidth
      const loadedHeight = img.naturalHeight

      const infoDivRendered = document.createElement('div')
      infoDivRendered.innerHTML = `Rendered: ${renderedWith} x ${renderedHeight}`
      infoDiv.appendChild(infoDivRendered)

      const infoDivLoaded = document.createElement('div')
      infoDivLoaded.innerHTML = `Loaded: ${loadedWidth} x ${loadedHeight}`
      infoDiv.appendChild(infoDivLoaded)

      const infoDivColor = document.createElement('div')
      infoDivColor.style.textWrap = 'wrap'
      const objectFitContain = getComputedStyle(img).objectFit === 'contain'
      if (loadedWidth === 0 || loadedHeight === 0) {
        infoDivColor.style.backgroundColor = 'grey'
        infoDivColor.innerHTML =
          'Image loaded later. Resize window to recalculate.'
      } else if (
        objectFitContain &&
        loadedWidth < renderedWith &&
        loadedHeight < renderedHeight
      ) {
        infoDivColor.innerHTML =
          'Loaded too small image (object-contain; height and width need to be large enough)'
        infoDivColor.style.backgroundColor = 'red'
      } else if (
        !objectFitContain &&
        (loadedWidth < renderedWith || loadedHeight < renderedHeight)
      ) {
        infoDivColor.innerHTML =
          'Loaded too small image (not object-contain; height or width need to be large enough)'
        infoDivColor.style.backgroundColor = 'red'
      } else if (
        ((loadedWidth >= renderedWith && loadedWidth < renderedWith * 2) ||
          (loadedHeight >= renderedHeight &&
            loadedHeight < renderedHeight * 2)) &&
        loadedWidth * loadedHeight < renderedWith * renderedHeight * 3 // don't load 3 times more pixles than needed
      ) {
        infoDivColor.style.backgroundColor = 'green'
        infoDivColor.innerHTML = 'Loaded image has the right size.'

        if (
          objectFitContain &&
          (loadedWidth < renderedWith || loadedHeight < renderedHeight)
        ) {
          infoDivColor.innerHTML +=
            ' (For object-contain only width OR height need to be large enough)'
        }
      } else {
        infoDivColor.innerHTML = 'Loaded too big image'
        infoDivColor.style.backgroundColor = 'yellow'

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
      infoDivColor.style.minHeight = '1.5em'
      infoDiv.appendChild(infoDivColor)

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

  const debounce = (callback, wait) => {
    let timeoutId = null
    return (...args) => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        callback(...args)
      }, wait)
    }
  }

  document.showImagesSizes = debounce(showImagesSizes, 100)
}

// would be better to keep this state in sync with the one in background.js,
// but I don't know how and this works as well.
if ('showImageSizesActive' in document && document.showImageSizesActive) {
  document
    .querySelectorAll(`.${document.infoDivClassName}`)
    .forEach((e) => e.remove())

  window.removeEventListener('resize', document.showImagesSizes)
  window.removeEventListener('scroll', document.showImagesSizes)

  document.showImageSizesActive = false
} else {
  document.showImagesSizes()

  window.addEventListener('resize', document.showImagesSizes)
  window.addEventListener('scroll', document.showImagesSizes)

  document.showImageSizesActive = true
}
