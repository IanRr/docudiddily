var fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    glob = require('glob'),
    conf = require('./docs.config.js')
    ;

// ##Fake mkdir##
// Quick function to make directories *recursively*

function mkdir(dir) {

    var segments = dir.split('/');
    var current = '.';
    var i = 0;

    while (i < segments.length) {
        current = current + '/' + segments[i];
        try {
            fs.statSync(current);
        } catch (e) {
            fs.mkdirSync(current);
        }
        i++;
    }
}




  // glob.sync('docs/**/*.md').forEach(function(file)  {
  //   var srcFile     = file.replace('docs/','lib/');
  //   var srcFileJs   = srcFile.replace('.md','.js');
  //   var srcFileTag  = srcFile.replace('.md','.tag');
  //   if (!fs.existsSync(srcFileJs) && !fs.existsSync(srcFileTag)) {
  //     fs.unlinkSync(file);
  //     console.log('deleted '+file);
  //   }
  // });

  conf.forEach(function(globstr)  {
    console.log('using glob:',globstr);
    glob.sync(globstr).forEach(function(file)  {
      processFile(file);
    });
  });





function processFile(filename)  {

    var output = '';
    var inside_code_block = false;

    var instream = fs.createReadStream('./'+filename,{encoding:'utf8'}),
    outstream = new (require('stream'))(),
    rl = readline.createInterface(instream, outstream)
    ;

    var outfile = './docs/' + filename;
    var outfile = outfile.replace(path.extname(outfile),'.md');
    var outfile_dir = path.dirname(outfile);


    mkdir(outfile_dir);

    rl.on('line', function (line) {
        var trimmed = line.trim();
        if (trimmed.length===0)  {
          output = output + '\n';
        } else if (trimmed.substr(0,2)==='//') {
          if (inside_code_block) {
            output = output.trim() + '\n```\n';
            inside_code_block = false;
          }
          output = output + trimmed.substr(2).trim() + '\n';
        } else {
          if (!inside_code_block) {
            output = output + '```\n';
            inside_code_block = true;
          }
          output = output + line + '\n';
        }
    });

    rl.on('close', function (line) {
      fs.writeFile(outfile, output, 'utf8', function(err) {
        if (err)  { console.error(err); }
        console.log('wrote doc for '+filename);
      });
    });

}
