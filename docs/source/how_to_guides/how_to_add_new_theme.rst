.. _how_to_add_new_theme:

How to add new theme
=============================================

We use EJS (A templating engine for node) to render pages and themes. Simple configurations like changing CSS / ASSETS for
theme and components doesn require knowledge of EJS beforehand but advance configurations like adding new components, 
external libraries will require understanding on the engine.

**Adding new theme (quickstart)**

1. Create a new folder with *yournewthemename* inside *idea2life/generator/views/themes/*.
2. Copy paste the contents of *default* theme from *idea2life/generator/views/themes/default* to this new folder.
3. Go to *generator/config.js* and change the *current_theme* config name to *yournewthemename*. 

Now you have a new theme (exactly same as the default theme) available for any customizations.

Before doing any customization it is important to understand the current theme structure.

**Theme structure**
NOTE - Theme *yournewthemename* has the same structure as the *default*

The *default* theme (located at *idea2life/generator/views/themes/default*) contains the following:

1. cam_component: This is the camera component on the prototyping page.
2. components: This folder contains the *assets/css/html* of supoprted components in idea2life like Paragraph, Button etc.
3. loader: This is the loading icon used on prototping page to indicate backend processing.
4. notification_component: This component display system notifications on protyping page.
5. static: This is the static folder containing all dependent libraries
6. config: Configuration for *default* theme
7. index.ejs: The index file for the theme (this is rendered in the browser with the help of EJS)
8. main_css.ejs: The core css file for the theme (css dependencies are included in index.ejs using this).
9. main_js.ejd: The core js file for the theme (js dependencies are included in index.ejs using this)
10. modal.ejs: This EJS contains the HTML for modal used on the prototype page.

    **NOTE - We only support themes which are based on bootstrap and jquery for now**.  


Changing Styles
--------------------

**Changing styles for your new theme**

Global level styling for the pages are plugged from *idea2life/generator/views/themes/yournewthemename/main_css.ejs*.

1. Go to *idea2life/generator/views/themes/yournewthemename/main_css.ejs*.
2. Change the font-family, background-color or color property under *body*.


**Changing icon stylesheet for your camera component**

Camera component is plugged from *idea2life/generator/views/themes/yournewthemename/cam_component*.

1. Go to *idea2life/generator/views/themes/yournewthemename/cam_component/css/custom/main.css*.
2. Change the styles under .icon or .fa-icon class based on *yournewthemename* requirement.

**Changing styles for loader component**

Loder components is plugged from *idea2life/generator/views/themes/yournewthemename/loader*.

1. Go to *idea2life/generator/views/themes/yournewthemename/loader/css/index.css*.
2. Change the styles under .loader class based on *yournewthemename* requirement.

**Changing styles for notification component**

Notification component is plugged from *idea2life/generator/views/themes/yournewthemename/notification_component*. We
are using toastr for notification

1. Go to *idea2life/generator/views/themes/yournewthemename/notification_component/css/index.css*.
2. Change the styles under .toast-* classes based on *yournewthemename* requirement.

Changing Assets for enhant components
-----------------------------------------

A lot of components like Carousel, Image, Video, Header etc use static assets like images / videos. Changing these
assets for the components is a matter of drag and drop as well. Let's take an example - suppose we want to change the 
logo icon displayed in the header. Following are the steps to do this:

1. All components reside under *idea2life/generator/views/themes/yournewthemename/components*.
2. Find the *Header* component folder inside the components.
3. The component folder has 3 sub folders::

    1. assets
    2. css
    3. js

4. Under the *assets* folder you can find the *logo.svg* file.
5. Replace this logo with your own but with the same name.

Changing the assets for any component can be done in the same way.









