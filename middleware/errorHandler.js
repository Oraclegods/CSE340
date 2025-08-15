function handleErrors(err, req, res, next) {
  console.error(err.stack);
  
  // Prepare template data with all required variables
  const templateData = {
    title: "Server Error",
    message: err.message,
    loggedin: req.session?.loggedin || false,
    accountData: req.session?.accountData || null,
    // Include any other variables your partials need
  };

  // Try to render the error template with proper path
  res.status(500).render('error/error', templateData, (renderErr, html) => {
    if (renderErr) {
      console.error('Failed to render error template:', renderErr);
      // Fallback plain text response
      return res.status(500).send(`
        <h1>Server Error</h1>
        <p>${templateData.message}</p>
        ${templateData.loggedin ? 
          `<p>Welcome ${templateData.accountData?.account_firstname || 'user'}</p>` : ''}
      `);
    }
    res.send(html);
  });
}

module.exports = handleErrors;