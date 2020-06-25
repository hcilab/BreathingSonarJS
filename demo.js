import BreathingSonarJS from './BreathingSonarJS.js';

let sonar;

async function main() {
  sonar = new BreathingSonarJS();
  await sonar.init();

  // Give user two seconds to perform each 'stack' breath
  setTimeout(function() { sonar.train('stack'); }, 4000);
  setTimeout(function() { sonar.train('stack'); }, 7000);
  setTimeout(function() { sonar.train('stack'); }, 10000);
  setTimeout(function() { sonar.train('stack'); }, 13000);

  // Register a callback function to console-log a message when stack detected
  setTimeout(function() { sonar.register('stack', function() { console.log('Stack Detected...'); }); }, 15000);
}


main();