/* English content for /en/. Loaded right after data.js: same projects, clips and videos, only the texts change. */
(function (S) {
  const WORKS = ['Keren Greenlight', 'Golan Group', 'Speak', 'Sona Studio', 'Muscle & Motion', 'Gelbard Studio', 'Yeda Shave Kesef',
    'Dr. Nemirovsky', 'Ofer & Maor', 'Washly', 'Barzi', 'Shay Kalif', 'Computer for Every Child', 'Kogumelo'];
  S.worksV3 = S.worksV3.map((w, i) => ({ ...w, n: WORKS[i] || w.n }));

  /* Video testimonials: the short quote is taken from the video itself, translated as closely as possible */
  const CLIENTS = {
    f: { n: 'Tohar', q: 'My income has been far more steady since I got a website.' },
    g: { n: 'Yahav Barzilai', q: 'Our factory finally looks truly professional.' },
    a: { n: 'Dr. Or Gefen', q: 'Everything was done exceptionally well, and fast.' },
    d: { n: 'Itai', q: 'Exactly what I wanted, exactly for our needs.' },
    e: { n: 'Sean Tzeiri', q: 'Within three days I already had a perfect website.' },
    b: { n: 'Shay Sabag', q: 'Lots of requests, lots of changes, and top professionalism the whole time.' },
  };
  S.clients = S.clients.map(c => ({ ...c, ...(CLIENTS[c.v] || {}) }));

  /* Written testimonials from the old site, translated */
  window.QUOTES_EN = [
    { n: 'Sean Blue', t: 'Singer & entrepreneur', i: '01', q: 'Liav built me a site that is polished down to the smallest details, and you can see the results in the leads coming in.' },
    { n: 'Amir Baldiga', t: 'Entrepreneur, lecturer & business mentor', i: '02', q: 'Professional, service minded and above all unique. Working with Liav is a gift that fell on my business out of the sky.' },
    { n: 'Nurit Bar', t: 'Business consultant', i: '03', q: 'I got professional, attentive and caring service from Liav, down to the small details. My sales page was upgraded end to end.' },
    { n: 'Avi Fried', t: 'AI expert for businesses', i: '04', q: 'Honestly, I think he is in the wrong profession and should be making works of art. Because that is what you get from him: a work of art, designed as your business website.' },
    { n: 'Yosef Cohen', t: 'Digital entrepreneur', i: '05', q: 'I have never met a business owner who treats his clients the way you treated me. If you are reading this, don\'t hesitate for a second. Liav is your guy.' },
    { n: 'Shay Kalif', t: 'Towing & roadside rescue', i: '06', logo: 1, q: 'Liav brings a rare mix of technical knowledge, creativity and service. I warmly recommend him to anyone looking for a true partner in the process.' },
    { n: 'Shira Daniel', t: 'Mentor', i: '07', q: 'Nobody beats Liav. Fast, professional work, and wow, what he did for me in just a few days. Worth every shekel, don\'t think twice.' },
    { n: 'Yogev Miro', t: 'Sales strategist', i: '08', q: 'After getting burned by other professionals, I finally found Liav. Together we built a landing page I still get compliments on, and it performs amazingly.' },
    { n: 'Natali Dabach', t: 'Professional photographer', i: '09', q: 'Nothing beats Liav\'s service and professionalism. Thank you for a site that is simply perfect and so right for me. I get tons of compliments on it.' },
    { n: 'Emanuel Kogan', t: 'Industrial design', i: '10', q: 'Liav built my marketing website end to end. Professional and knowledgeable, lives the customer experience, with a strong design sense and an eye for detail.' },
    { n: 'Tal Eliyahu', t: 'Tiltan mortgage consulting', i: '11', q: 'Liav built my business website professionally and creatively. The process was efficient, organized and fully transparent at every stage.' },
  ];
})(window.SITE);
