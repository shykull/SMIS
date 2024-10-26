import React from 'react';

function Footer() {
  return (
    <footer className="bg-body-tertiary text-light py-3 mt-5">
      <div className="container mb-3">
        <div className="card text-center" style={{ height: 'auto' }}>
          <div className="card-header">
            &copy; {new Date().getFullYear()} All rights Reserved.{' '}
            Powered by <a 
              className="link-offset-2 link-body-emphasis link-underline-opacity-25 link-underline-opacity-100-hover" 
              href="https://www.starc-my.com" 
              target="_blank"
              rel="noopener noreferrer"
            >
              STARC LLP
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

